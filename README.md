# patterns-api
Node backend for Tradecraft [Patterns App](https://github.com/rithmschool/patterns-client).

## Getting Started

fork the repository (https://github.com/rithmschool/patterns-api)

```bash

$ git clone https://github.com/[YOUR_REPOSITORY]/patterns-api.git
$ cd patterns-api
$ npm install
$ touch .env

```

### Add to .env file
```
GOOGLE_CLIENT_ID=* 
GOOGLE_CLIENT_SECRET=*
NODE_ENV=development
SECRET_KEY=*
CALLBACK_URL=http://localhost:3000/auth/google/callback
(verify what * is with your team)
```

### Starting the Backend Server
- open two terminals
	- in one terminal
		`$ mongod`
	- in second terminal
		`$ npm start`

## General Structure

The website consists of the following general components:

* activities
* types
* assets
* users
* stages

## Routes

### `routes/auth.js`
Used to set up OAuth login using Google

* GET OAuth `/google`
* POST OAuth `/google/callback`

### `routes/activites.js` (login required for all)
Used to get and add activities

* GET all activities `/users/{user_id}/activities` 
* POST add new activity `/users/{user_id}/activities`

### `routes/assets.js` (login required for all)
Used to CRUD assets (as children of parent assets)

* GET all assets of a type `/types/{type_id}/assets`
* POST an asset of a given type `/types/{type_id}/assets`
* DELETE an asset of a given type `/types/{type_id}/assets/{asset_id}` - ensureCorrectUser
* EDIT an asset of a given type `/types/{type_id}/assets/{asset_id}` - ensureCorrectUser

### `routes/types.js` (login required for all)
Used to CRUD types and top-level assets (i.e., those without parent assets) 

* GET all types `/types`
* POST a new type `/types`
* DELETE a type `/types/{type_id}` - ensureCorrectUser
* EDIT a type `/types/{type_id}` - ensureCorrectUser

### `routes/stages.js` (login required for all)
Used to patch stages

* PATCH given stage `/stages/{stage_id})`

## Tests

You can run tests with `npm test` which will recursively run all the tests. Note: the database has to be running in order to execute the endpoint tests.

View the spec in: `test/routes/activitySpec.js`
 
