import React, {useEffect, useState} from "react";

const RepoDisplay = (props) => {
    const[repos, setRepos] = useState([]);
    const[userFilter, setUserFilter] = useState("all");
    const[users, setUsers] = useState([]);

    let {user, repo} = props;

    useEffect(() => {
        getCommits();
        getCollaborators();
    }, []);
    
    // Fetches all commits for a repo
    async function getCommits() {
        let res = await fetch(`https://api.github.com/repos/${user}/${repo}/commits`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.REACT_APP_GITHUB_API_KEY}`
            }
        });

        let repoList = await res.json();
        let repos = [];
        await Promise.all(repoList.map(async (repoEntry) => {
            res = await fetch(`https://api.github.com/repos/${user}/${repo}/commits/${repoEntry.sha}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_GITHUB_API_KEY}`
                }
            })
            let repoJson = await res.json();
            repos.push(repoJson);
        }))

        setRepos(repos);
    }

    // Grabs list of collaborators to save from sorting through commit authors.
    // Can create a blacklist of faculty
    async function getCollaborators() {
        let res = await fetch(`https://api.github.com/repos/${user}/${repo}/collaborators`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.REACT_APP_GITHUB_API_KEY}`
            }
        });

        if(res.ok) {
            let json = await res.json();
            let userList = json.map(user => user.login);
            setUsers(userList);
        } else {
            console.log(res);
        }
    }

    let repoFormat = repos
    .filter(repo => userFilter==="all"||repo.author.login.toLowerCase() === userFilter)
    .map((repo) => {
        if(repo) {
            return(
            <div key={repo.sha} className="commit">
                <p>{repo.author?repo.author.login:"unknown"}</p>
                <a href={repo.html_url} target="_blank">{repo.commit.message}</a>
                <p>{new Date(Date.parse(repo.commit.author.date)).toLocaleDateString()}</p>
                <div>
                    <p>Total: {repo.stats.total}</p>
                    <p>Added: {repo.stats.additions}</p>
                    <p>Removed: {repo.stats.deletions}</p>
                </div>
            </div>
            )
        }
    });

    return (
        <div className="repoContainer">
            <select onChange={e => {setUserFilter(e.target.value);console.log(userFilter)}}>
                <option value="all">Show All</option>
                {users.map(user=><option value={user.toLowerCase()}>{user}</option>)}
            </select>
            <div className="commits">
            <div className="commitsHeader">
                <p>User</p>
                <p>Commit Message</p>
                <p>Date</p>
                <p>Changes</p>
            </div>
                {repoFormat}
            </div>
        </div>
    )
}

export default RepoDisplay;