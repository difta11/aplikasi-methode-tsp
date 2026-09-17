import copy
import math
import random
import os
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# ==========================================
# 1. FUNGSI UTILITAS (JARAK & BIAYA)
# ==========================================
def calculate_distance(x1, y1, x2, y2):
    """Menghitung jarak Euclidean antara dua titik."""
    return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

def calculate_total_cost(tour, places):
    """Menghitung total jarak dari rute perjalanan (tour)."""
    total_d = 0
    n = len(tour)
    for i in range(1, n):
        x1, y1 = places[tour[i - 1]]
        x2, y2 = places[tour[i]]
        total_d += calculate_distance(x1, y1, x2, y2)
    
    # Kembali ke titik awal (closing loop)
    x1, y1 = places[tour[n - 1]]
    x2, y2 = places[tour[0]]
    total_d += calculate_distance(x1, y1, x2, y2)
    return total_d

# ==========================================
# 2. INTI ALGORITMA TABU SEARCH
# ==========================================
def tabu_search(places, max_iter=1000, tabu_tenure=15, num_neighbors=50):
    """
    DISCLAIMER: Anda bisa menyesuaikan parameter default di sini 
    atau membiarkannya dikontrol dinamis dari request frontend HTML.
    """
    n = len(places)
    
    # Inisialisasi rute awal secara acak
    current_tour = list(range(n))
    random.shuffle(current_tour)
    
    best_tour = list(current_tour)
    best_cost = calculate_total_cost(best_tour, places)
    
    tabu_list = {} # Format: {(i, j): expiration_iteration}
    
    for iteration in range(max_iter):
        best_neighbor = None
        best_neighbor_cost = float('inf')
        best_move = None
        
        evaluated_moves = set()
        while len(evaluated_moves) < min(num_neighbors, (n * (n - 1)) // 2):
            i, j = random.sample(range(n), 2)
            if i > j:
                i, j = j, i
            move = (i, j)
            
            if move in evaluated_moves:
                continue
            evaluated_moves.add(move)
            
            # Buat tetangga dengan operasi swap
            neighbor = list(current_tour)
            neighbor[i], neighbor[j] = neighbor[j], neighbor[i]
            cost = calculate_total_cost(neighbor, places)
            
            # Cek status Tabu & Aspiration Criteria
            is_tabu = False
            if move in tabu_list and tabu_list[move] > iteration:
                if cost < best_cost: # Aspiration override
                    is_tabu = False
                else:
                    is_tabu = True
            
            if not is_tabu and cost < best_neighbor_cost:
                best_neighbor_cost = cost
                best_neighbor = neighbor
                best_move = move
                
        if best_neighbor is None:
            break
            
        current_tour = best_neighbor
        
        if best_neighbor_cost < best_cost:
            best_cost = best_neighbor_cost
            best_tour = list(best_neighbor)
            
        if best_move:
            tabu_list[best_move] = iteration + tabu_tenure
            
        # Hapus memori tabu yang kedaluwarsa
        tabu_list = {m: exp for m, exp in tabu_list.items() if exp > iteration}
        
    return best_tour, best_cost

# ==========================================
# 3. API ENDPOINT UNTUK FRONTEND HTML
# ==========================================
@app.route('/api/optimize', methods=['POST'])
def optimize_route():
    try:
        places = None
        
        # DISCLAIMER: Bagian ini menangani input dari HTML. 
        # HTML bisa mengirim data via Form-data (File Upload) atau JSON Body.
        
        if 'file' in request.files:
            file = request.files['file']
            # DISCLAIMER: Pastikan file excel/csv yang diupload frontend memiliki kolom 'x' dan 'y'
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
            places = df[['x', 'y']].to_numpy()
            
        elif request.is_json:
            data = request.get_json()
            # Format JSON dari HTML: {"coordinates": [[x1, y1], [x2, y2], ...]}
            places = data.get('coordinates')
            places = [[float(pt[0]), float(pt[1])] for pt in places]
            
        if places is None or len(places) < 3:
            return jsonify({"status": "error", "message": "Data koordinat tidak valid atau kurang dari 3 titik!"}), 400

        # Ambil parameter dari request HTML (jika tidak dikirim, gunakan default)
        max_iter = int(request.form.get('max_iter', request.json.get('max_iter', 1000) if request.is_json else 1000))
        tabu_tenure = int(request.form.get('tabu_tenure', request.json.get('tabu_tenure', 15) if request.is_json else 15))
        num_neighbors = int(request.form.get('num_neighbors', request.json.get('num_neighbors', 50) if request.is_json else 50))

        # Jalankan algoritma Tabu Search
        best_tour, best_distance = tabu_search(
            places=places, 
            max_iter=max_iter, 
            tabu_tenure=tabu_tenure, 
            num_neighbors=num_neighbors
        )

        # Format respons JSON yang akan dikonsumsi oleh JavaScript di HTML
        response_data = {
            "status": "success",
            "best_distance": round(best_distance, 2),
            "best_tour": best_tour,
            # Urutan koordinat lengkap untuk digambar garis jalurnya di Canvas / Chart.js / Leaflet HTML
            "route_coordinates": [places[i] for i in best_tour + [best_tour[0]]]
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # DISCLAIMER: Ubah port atau matikan debug mode saat sudah di-deploy ke server produksi
    app.run(debug=True, port=5000)