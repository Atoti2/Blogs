const totalLikes = (blogs) => {
    return blogs.reduce((acc, curr) => acc + curr.likes, 0)
}

const favoriteBlog = (blogs) => {
    blogs.sort((a, b) => b.likes - a.likes)
    return blogs[0]
}   

const mostBlogs = (blogs) => {
    const authorCounts = {}

    blogs.forEach((blog) => {
        if(authorCounts[blog.author]){
            authorCounts[blog.author]++
        }else{
            authorCounts[blog.author]=1
        }
    })

    let topAuthor = null
    let maxBlogs = 0

    for(const author in authorCounts){
        if(authorCounts[author]> maxBlogs){
            maxBlogs = authorCounts[author]
            topAuthor = author
        } 
    }
    return{
        author: topAuthor,
        blogs: maxBlogs
    }
}

const mostLikes = (blogs) => {
    const blogLikes = {}

    blogs.forEach((blog) => {
        if(blogLikes[blog.author]){
            blogLikes[blog.author]+=blog.likes
        }else{
            blogLikes[blog.author]=blog.likes
        }
    })
    let topAuthor = null;
    let maxLikes = 0;

    for(const author in blogLikes){
        if(blogLikes[author] > maxLikes){
            maxLikes = blogLikes[author]
            topAuthor = author
        }
    }
 
    return{
        author: topAuthor,
        likes: maxLikes
    }
 }

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }

