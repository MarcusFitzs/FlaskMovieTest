import os

import numpy as np
import pandas as pd
from flask import Flask, request
from flask_cors import CORS
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors

from joblib import Parallel, delayed
import joblib

import json

app = Flask(__name__) # new
CORS(app) # new

@app.route('/upload', methods=['POST'])
def upload():

    # Load model
    knn_model = joblib.load('firsttest.h5')

    # Load csv(s)
    movieUser_df = pd.read_csv('movieUser.csv')
    refined_dataset = pd.read_csv('refined.csv')

    # Create list of movies from columns in movieUser_df and make into scipy sparse matrix
    movie_list = movieUser_df.columns
    movieUser_scipy_df = csr_matrix(movieUser_df.values)

    # Fit the model to the scipy sparce matrix dataframe
    knn_model.fit(movieUser_scipy_df)

    # Creating empty arrays that will hold the data
    simUsers = []
    userDistances = []
    highestMovies = []
    recommendedMovies = []

    # Find most similar users to target user
    def similar_users(user, n = 5):
        # Convert values to numpy array and pass through model and output values for user and distance
        knn_input = np.asarray([movieUser_df.values[user-1]])
        distances, indices = knn_model.kneighbors(knn_input, n_neighbors=n+1)
        
        for i in range(1,len(distances[0])):
            # Passing the data to empty arrays
            simUsers.append(indices[0][i]+1)
            userDistances.append(distances[0][i])
        return indices.flatten()[1:] + 1, distances.flatten()[1:]

    # Function that outputs the top n movies based on ratings of similar users from the mean rating list
    def recommend_movies(n):
        n = min(len(mean_ratings_list),n)
        recommendedMovies.append(list(movie_list[np.argsort(mean_ratings_list)[::-1][:n]]))
        return recommendedMovies

    # Variables taken from front end form
    target_user = int(request.form["target_user"])
    no_of_highest = int(request.form["no_of_highest"])
    no_of_similar_users = int(request.form["no_of_similar_users"])
    no_of_movies = int(request.form["no_of_movies"])+1

    
    highestMovies.append(list(refined_dataset[refined_dataset['userId'] == target_user].sort_values('rating', ascending=False)['title'])[:no_of_highest])

    # Calling the similar_user function, providing the target user to check and how many similar users to find (5)
    # Passing similar users to similar_user_list and similar user's distances from the target user to ditance_list
    similar_user_list, distance_list = similar_users(target_user, no_of_similar_users)
    
    # Adding weights to similar user's ratings depending on their distance from the target user
    weighted_list = distance_list/np.sum(distance_list)

    # Storing all of the ratings submitted by the users determined as most similar
    similar_user_ratings = movieUser_df.values[similar_user_list]

    # Adding a column vector, increasing dimensions of weighted_list by adding axis of movies from movies_list
    weighted_list = weighted_list[:,np.newaxis] + np.zeros(len(movie_list))

    # Adding the weights to user ratings and creating a new list of mean, weighted ratings
    ratings_matrix = weighted_list*similar_user_ratings
    mean_ratings_list = ratings_matrix.sum(axis =0)

    # Call recommend_movies function and pass amount of movies to recommend
    recommend_movies(no_of_movies)


    # Store arrays in a dictionary to transform into JSON
    dict1 = {'Users_Top_Movies': highestMovies, 'Similar_Users': simUsers, 'Sim_User_distances': userDistances, 'Recommendatons': recommendedMovies}

    # Convert any instances of np.int64 variables to int to get around python/JSON bug
    def convert(o):
        if isinstance(o, np.int64): return int(o)  
        raise TypeError

    # Convert dictionary to JSON and send to front end
    return json.dumps({'data': dict1}, default=convert)

if __name__ == '__main__':
    app.run(debug=True, host="127.0.0.1", port=5000)