import { useState } from 'react';

const App = () => {
    const [prediction, setPrediction] = useState(null);
    //const [imdb, setImdb] = useState(null);

    const [records, setRecords] = useState([]);

    const [apiCalls, setApiCalls] = useState(0);

    const [loading, setLoading] = useState(false);

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
            console.log("checkpoint1");
            console.log(data.data);
            setPrediction(data);
        });
    };

    const formatTop = () => {
        let top = [];
        for (let i = 0; i <= document.getElementById("no_of_highest").value; i++) {
            top.push(<p>{prediction.data.Users_Top_Movies[0][i]}</p>);
        }
        return top;
    };

    const formatSim = () => {
        let sim = [];
        for (let i = 0; i <= document.getElementById("no_of_similar_users").value-1; i++) {
            sim.push(<p>User #{prediction.data.Similar_Users[i]}, seperated by a distance of {prediction.data.Sim_User_distances[i]}</p>);
        }
        return sim;
    };

    const formatRec = async () => {
        setLoading(true);
        setApiCalls(apiCalls + 1);
        let rec = [];
        let no_movies = 5;
    
        for (let i = 1; i <= no_movies; i++) {
          let imdbHolder = "No";
          const res = await fetch(`https://catfact.ninja/fact`, {
            method: "GET"
          }).then((res) => res.json());
    
          imdbHolder = res?.fact || "No";
    
          rec.push(imdbHolder);
        }
    
        setRecords(rec);
        setLoading(false);
    };


    // if (indicator <= no_movies) {
                
    //     fetch(`https://catfact.ninja/fact`, {
    //         method: 'GET',
    //     })
    //     .then(res => res.json())
    //     .then(data => {
    //         //console.log("checkpoint2 " + i);
    //         //console.log(data);
    //         //imdbHolder = data.fact;
    //         imdbHolder = "No";
    //         console.log("1 " + imdbHolder);
    //     });
    //     indicator++;
    // }

    

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
                    onClick={formatRec} 
                    disabled={loading}
                />
            </form>
            <h1>Users Top Movies</h1>
            { prediction && formatTop() }
            <br />
            <h1>Users Most Similar to Target User</h1>
            { prediction && formatSim() }
            <br />
            <h1>Recommendations Based on Similar Users</h1>
            { prediction && formatRec() }
            <p>API calls: {apiCalls}</p>
            {!loading && records.map((text, idx) => <li key={idx}>{text}</li>)}

            {/* <h1>Users Top { document.getElementById("no_of_highest").value } Movies</h1>
            { prediction && formatTop() }
            <br />
            <h1>The { document.getElementById("no_of_similar_users").value } Users Most Similar to Target User</h1>
            { prediction && formatSim() }
            <br />
            <h1>Top { document.getElementById("no_of_movies").value } Recommendations Based on Similar Users</h1>
            { prediction && formatRec() } */}
        
        </div>
    );
};

export default App;