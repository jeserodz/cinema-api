Cinema API
==========

Web API and scraper for dominican website https://cinema.com.do.

# Requirements
- Node.js - ver. >= 10.0.0
- NPM

# Setup

1. Close repo
1. `npm install`
1. `npm start`

# Endpoints

## GET General Data
Get all cities and the cinemas for each.

- `/api/api/v1/data`

## GET Cinema
Get details, rooms and movies schedule for a cinema

- `/api/api/v1/cinemas/:id`

## GET Movie
Get details for a movie

- `/api/api/v1/movie/:id`
