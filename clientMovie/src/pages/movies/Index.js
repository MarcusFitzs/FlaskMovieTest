import axios from '../../config';
import { useState, useEffect } from 'react';

const Index = () => {
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        axios.get(`/SearchTitle/k_zvyi75fh/${id}`)
            .then((response) => {
                console.log(response.data);
                setMovies(response.data);
            })
             .catch((err) => {
                console.error(err);
            });
    }, []);
  
    const onSubmit = async e => {
        e.preventDefault();
  
        const formData = new FormData();
        formData.append("target_user", document.getElementById("target_user").value)
        formData.append("no_of_highest", document.getElementById("no_of_highest").value)
        formData.append("no_of_similar_users", document.getElementById("no_of_similar_users").value)
        formData.append("no_of_movies", document.getElementById("no_of_movies").value)
  
        fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log("checkpoint");
            console.log(data.data);
            setPrediction(data);
        });
    };
  
    return (
        <div classMovieName='App'>
            <form onSubmit={onSubmit}>
                <div className='custom-file'>
                    <label for="target_user">target_user</label>
                    <input type="number" id="target_user" name="target_user" />
                    <br />
                    <br />
                    <label for="no_of_highest">no_of_highest_rated_movies_by_target_user</label>
                    <input type="number" id="no_of_highest" name="no_of_highest" />
                    <br />
                    <br />
                    <label for="no_of_similar_users">no_of_similar_users</label>
                    <input type="number" id="no_of_similar_users" name="no_of_similar_users" />
                    <br />
                    <br />
                    <label for="no_of_movies">no_of_movies_to_recommend</label>
                    <input type="number" id="no_of_movies" name="no_of_movies" />
                </div>
                <input
                    type='submit'
                    value='Submit'
                    className='btn btn-primary btm-block mt-4'
                />
            </form>
            <h1>Users Top Movies</h1>
            {prediction && <p>{prediction.data.Users_Top_Movies}</p>}
            <br />
            <h1>Users Most Similar to Target User</h1>
            {prediction && <p>{prediction.data.Similar_Users}</p>}
            <br />
            <h1>Similar User's Distances</h1>
            {prediction && <p>{prediction.data.Sim_User_distances}</p>}
            <br />
            <h1>Recommendations Based on Similar Users</h1>
            {prediction && <p>{prediction.data.Recommendatons[0]}</p>}
            <br />
            <h1>Users Most Similar to Target User</h1>
            {prediction && <p>{prediction.data.Similar_Users}</p>}
        
        </div>
    );
};
  
export default Index;