# Llama Blogging Platform
Link to Front End GitHub: https://github.com/the-llamas/Front-End---Blog
Link to Deployed App: https://the-llamas.github.io/Front-End---Blog
Link to Back End GitHub:https://github.com/the-llamas/blog-api
Link to Heroku App: https://blog-api-back-end.herokuapp.com
​
## Summary
This is a blogging plaform for blogging about llamas!
Users can view posts, create posts, and interact by adding comments to any users posts
​
## Technologies used
- Express
- Node.js + NPM
- Javascript
- MongoDB
- Mongoose

​
## Planning
Our initial planning process began with creating our Entity Relationship Diagram. Since our project required a user to have a relationship with blogs, and additionally for blogs to have relationships with both the user and comments, we initally planned on creating our blog collection first. Then upon blog collection creation success, we would make the collection for the comments and move forward from there.

## Process
​We first built the relationships between the user and blogs using mongoose in our Blog model. Once we had created the model, routes, imported the routes in our server, and used our routes for the Blog collection, we then moved on to creating our comment collection. Creating all of the requirements for the comments.

## Problem Solving Strategy
​Our problem solving strategy first began with asking outher teamates to review our work for errors. If this step was unsuccessful, we would then use a search engine or class documents to help us solve our problem.

On day 2 of the project, our team encountered a problem with updating a specific comment on a post that belonged to the user logged in. We solved this problem by using populate() available from mongoose.

## Wireframes
​https://imgur.com/a/YQYY1xG

## User stories
- As a user, I want to sign up with email and password.
- As a user, I want to sign in with email and password.
- As a user, I want to change my password.
- As a user, I want to sign out.
- As a user, I want to see all blog posts and comments.
- When signed in, I want to create blog posts.
- When signed in, I want to comment on any blog post.
- When signed in, I want to update my blog posts and comments.
- When signed in, I want to delete my blog posts and comments.
​
## ERD
​https://imgur.com/a/08YKk1E

## API Routes
| Verb   | URI Pattern        | Request Body      | Headers   | Action              |
|--------|--------------------|-------------------|-----------|---------------------|
| POST   | `/sign-up`         | **credentials**   | N/A       | user sign-up        |
| POST   | `/sign-in`         | **credentials**   | N/A       | user sign-in        |
| DELETE | `/sign-out`        | N/A               | **Token** | user sign-out       |
| PATCH  | `/change-password` | **passwords**     | **Token** | change-password     |
|        |                    |                   |           |                     |
| GET    | `/posts`           | N/A               | N/A       | index posts         |
| GET    | `/posts/:id`       | N/A               | N/A       | show single post    |
| POST   | `/posts`           | `post: {}`        | **Token** | create post         |
| PATCH  | `/posts/:id`       | post              | **Token** | update post         |
| DELETE | `/posts/:id`       | N/A               | **Token** | remove post         |
|        |                    |                   |           |                     |
| GET    | `/comments`        | N/A               | **Token** | index post comments |
| GET    | `/comments/:id`    | N/A               | **Token** | show post comment   |
| POST   | `/comments`        | `comment: {}`     | **Token** | create post comment |
| PATCH  | `/comments/:id`    | comment           | **Token** | update post comment |
| DELETE | `/comments/:id`    | N/A               | **Token** | delete post comment |

## Unsolved Problems
We would love to add in a feature so that each user could add in avatar and save their profile picture. We are also going over the idea of adding a "follow" feature, so that each user can follow a specific user of their choice.
