def run_simulated_annealing(
    places,
    cooling_rate=0.99,
    initial_temperature=10000,
    max_iterations=15000
):
    """
    Run Simulated Annealing for TSP.

    Parameters:
        places: list of (x, y) coordinates
        cooling_rate: temperature reduction factor
        initial_temperature: starting temperature
        max_iterations: maximum number of iterations

    Returns:
        dict:
            route      : best route found
            distance   : total distance of best route
            time       : execution time in seconds
            iterations : number of iterations
    """

    start_time = time.time()

    n = len(places)

    if n < 2:
        raise ValueError("places must contain at least 2 points.")

    temperature = initial_temperature

    # Initial solution
    route = random.sample(range(n), n)

    # Best solution found
    best_route = route.copy()
    best_distance = totaldistancetur(route, places)

    for _ in range(max_iterations):

        old_distance = totaldistancetur(route, places)

        # Create neighbor
        i, j = sorted(random.sample(range(n), 2))

        new_route = route.copy()
        new_route[i], new_route[j] = new_route[j], new_route[i]

        new_distance = totaldistancetur(new_route, places)

        # Acceptance condition
        if (
            new_distance < old_distance
            or random.random()
            < math.exp((old_distance - new_distance) / temperature)
        ):
            route = new_route

        # Update best solution
        current_distance = totaldistancetur(route, places)

        if current_distance < best_distance:
            best_route = route.copy()
            best_distance = current_distance

        # Cooling
        temperature *= cooling_rate

        if temperature < 1e-10:
            temperature = 1e-10

    elapsed_time = time.time() - start_time

    return {
        "route": best_route,
        "distance": best_distance,
        "time": elapsed_time,
        "iterations": max_iterations
    }
    
def totaldistancetur(route, places):
    d = 0

    for i in range(1, len(route)):
        x1, y1 = places[route[i - 1]]
        x2, y2 = places[route[i]]

        d += distance(x1, y1, x2, y2)

    # Return to starting point
    x1, y1 = places[route[-1]]
    x2, y2 = places[route[0]]

    d += distance(x1, y1, x2, y2)

    return d

def distance(x1, y1, x2, y2):
    return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)