# bollette-server

### [SWAGGER](https://bollette-server-v2.mirkotorrisi1.repl.co/documentation)

Express server for my betting web app

Bollette Calcio is a web app which allows to place fake bets on the most popular soccer/football championships.

Server made with Nest.js, using Redis for caching and storing tokens, and MySql as db to store tickets and users data.

To provide odds I rely on a 3rd party service: [the odds api](https://the-odds-api.com)

To place bets, api must call championship route first, in order to load fresh odds related to the desired market and championship.

To bring match results and update won/lost tickets and pay users for their wins, I call [another server built in Flask](https://github.com/Mirkotorrisi/soccer_results_scraper)

## ROUTES

- **GET /championships/:championship/** route takes one parameters: championship, it provides all the odds for that championship

- **GET /championships/all/** route takes no parameters: it returns an array with all the matches of all the championships sorted by start date.

After desired odds are cached, user can place some bets on them throught the /bets route.

- **POST /bets** can have 3 body attributes: match, odd (required), ticket_id. If no ticket id is provided, will be generated another ticket. To create a ticket with multiple bets, is needed to use it.
  If user bets on a game he already betted in, the past bet will be overwritten, because the first rule of betting is that you can't place different - incongruent bets on the same game.

- **DELETE /bets** needs match number and ticket_id on body. Deletes selected bet from specified ticket

- **POST /checkout/:ticket_id** takes one request parameter (ticket id), one body attribute (bet import) and user token from header. Checks if token is provided, if ticket exists, if user's account has enough money. After that, stores ticket on DB and decrements user's account sum.

- **GET /ranking** returns fetched list of all users' accounts
- **GET /ranking/maxwins** returns fetched list of all users' accounts
- **POST /users/register** needs email, password, repeat password and username. Checks if username or email is already stored on the db, then generates hashed password and a token. Token is stored on Redis' db with expiration on 10 minutes, then is returned as header.
- **POST /users/login** needs email or username and password. Checks if username or email and password are valid, then generates a token. Token is stored on Redis' db with expiration on 10 minutes, then is returned as header.
- **GET /users/account_sum** if authenticated, returns user account sum.
- **GET /users/ticket** if authenticated, returns user's tickets.

- **POST/slot** a fake slot return
