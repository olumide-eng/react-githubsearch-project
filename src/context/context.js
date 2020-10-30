import React, { useState, useEffect } from 'react'
import mockUser from './mockData.js/mockUser'
import mockRepos from './mockData.js/mockRepos'
import mockFollowers from './mockData.js/mockFollowers'
import axios from 'axios'

const rootUrl = 'https://api.github.com'

const GithubContext = React.createContext()
// provider, consumer - GitHubContext.Provider

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser)
  const [repos, setRepos] = useState(mockRepos)
  const [followers, setFollowers] = useState(mockFollowers)
  // request loading
  const [requests, setRequests] = useState(0)
  const [isloading, setIsLoading] = useState(false)

  // errors

  const [error, setError] = useState({ show: false, msg: '' })

  const searchGithubUser = async (user) => {
    toggleError()
    setIsLoading(true)
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    )
    console.log(response)
    if (response) {
      setGithubUser(response.data)
      const { login, followers_url } = response.data
      // repoes
      axios(`${rootUrl}/users/${login}/repos?per_page=100`).then((response) =>
        setRepos(response.data)
      )
      // followers
      axios(`${followers_url}?per_page=100`).then((response) =>
        setFollowers(response.data)
      )
      // more logic here
      // repos
      // https://api.github.com/users/john-smilga/repos?per_page=100
      // followers
      // https://api.github.com/users/john-smilga/followers
    } else {
      toggleError(true, 'there is no user with that user name')
    }

    checkRequests()
    setIsLoading(false)
  }
  // check rate
  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data

        setRequests(remaining)
        if (remaining === 0) {
          toggleError(true, 'sorry you have exceeded your hourley rate limit')
        }
      })
      .catch((err) => console.log(err))
  }
  function toggleError(show = false, msg = '') {
    setError({ show, msg })
  }
  // error
  useEffect(checkRequests, [])
  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        isloading,
      }}
    >
      {children}
    </GithubContext.Provider>
  )
}

export { GithubProvider, GithubContext }
