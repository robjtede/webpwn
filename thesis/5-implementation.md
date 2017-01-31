# Implementation
Note: due to the up-to-date-ness of this implementation, Node v7.6.0 or above is required to run the servers.

## File Structure
All of the necessary components of this project are contained in a single directory. Figure 10 shows the entire structure. Each file and folders purpose is outlined below:

- The two Koa web servers, `server.js` and `malicious-server.js`, runnable via npm scripts, are in the root directory.
- `guide/` contains the user guide in markdown and PDF format).
- `lib/` contains custom and modified middleware used in the blog server. Since the `koa-morgan` and `koa-file-server` middlewares were using deprecated APIs, they were upgraded so warnings did not appear when running the server.
- `node_modules/` is a standard folder in Node projects that contains all (~850 or so in this case) of the packages required to make the application run; this projects dependencies listed in `package.json` as well as their dependencies and the dependencies' dependencies, etc.
- `public/` holds all of the static assets for the blog. In this case there is only one subfolder `style/` which holds CSS files but images and scripts would also go here.
- `routes/` contains the route definitions imported into `server.js`. Each file separates the routing into categories so it is easy to determine where behaviour for a given endpoint is defined.
- `solutions/` contains git patch files for each of the 5 vulnerability types covered by this project for use when git commands are unavailable.
- `test/` contains two types of tests as covered in Section 4.3.5, API testing and browser testing. Tests are run using npm scripts.
- `thesis/` holds all the source files for this, the written portion of the project.
- `views/` contains the Pug template files.
- `.editorconfig`, `.eslintrc` and `.stylelintrc` are editor and linter configurations to keep code style consistent while editing the code.
- `package.json` lists all the project's dependencies and defines npm scripts used for starting the servers and running tests.
- Unmentioned files are irrelevant to the implementation.

![Project File Structure](./assets/implementation/file-structure.png){width=70%}

## The Guide
The guide is available to read as a markdown file or as a PDF in the `guide/` directory. It serves as a walk-though for someone learning by themself or as a lesson plan for a more formal teaching environment. It satisfies all the design idea in Section 4.2.1 and sets out 5 exercises for the user to follow along with.

![Markdown Guide](./assets/implementation/guide.png){width=80%}

## The Blog
### Homepage
The homepage is usually the central hub for a website. In this case, not much can be done with the homepage as it is not required for the scope of the requirements. Most of the body copy is lorem ipsum text but there is some guidance and the navigation bar to guide the user along.

![Homepage](./assets/implementation/home.png){width=80%}

### Login Page
It is possible to perform some actions without logging in on this site but the forthcoming examples will show logged in pages. A clear username and password prompt is shown where the user will enter the pre-defined login details. In this case username: `admin` and password: `nimda`. A second user exists on the system with username: `user` and password: `resu`.

Clicking "Login" will direct the user back to the home page if the credentials are correct. From this point on, the login item on the navigation bar will now show a link to the user's profile page.

![Login page](./assets/implementation/login.png){width=80%}

### Article List
The article list page simply shows all the articles' titles that link to the full article, authors that link to that user's profile page, post date/time and how many comments it has. If the user is logged in, they will have be presented the option to create a new article.

![Article list page](./assets/implementation/list.png){width=80%}

### Article Create
The article creation page has two fields, a single line text input for the title and a text area for the body copy. The body copy can be formatted using Markdown syntax. Clicking "Confirm" will submit the changes to the database and the user will be directed to the newly created article page.

![Article list page](./assets/implementation/create.png){width=80%}

### Article Display
This page shows a full article with large title, formatted body copy and comments section. If the user is logged in they will be able to create a comment. If the article was created by the logged in user they will be presented the option to edit or delete the article. The design of the page also matches the initial mockup (Figure 6) quite well.

![Article view page](./assets/implementation/article.png){width=80%}

### Article Edit
THe article edit page looks and functions the exact same way as the new article page but the contents of the title and content are already filled in. Clicking "Confirm" will take the user back to the article page.

![Editing an article](./assets/implementation/edit.png){width=80%}

### Article Delete
Clicking "Delete Article" from the article display page will not show any confirmation prompt, it will submit a form asking the server to delete the article and the user will be directed back to the article list page.

### Commenting
Completing the comment form at the bottom of an article display page with a comment message and clicking "Submit" will post the comment to the 4 and the page will refresh showing the new comment. Like articles, comments can be formatted using Markdown syntax. Comments are not editable or deletable in this project.

![Commenting on an article](./assets/implementation/comment.png){width=80%}

## Malicious Server
The malicious server's website, as shown in Figure 18, is a very simple form asking for an email address. It does not actually matter what is entered into this field. The form has pre-filled hidden fields that will be submitted to the article creation endpoint upon clicking "GET YOUR FREE iPHONE NOW". In reality, a malicious website like this could store this data and more.

Figure 19 shows the result of this action. As mentioned in Section 4.2.3, this site does not even need to submit the form directly and expose it's misdeeds. It could use JavaScript to submit a form invisibly to the user and hide the redirect.

![Malicious site offering free iPhones](./assets/implementation/malicious.png){width=80%}

![Result of submitting malicious form](./assets/implementation/malicious-result.png){width=80%}

## Manual Testing
A series of manual tests were performed on the vulnerable site in order to determine what was possible and what should be converted into automatic tests for the test suites.

### SQL Injection
SQL injection is very dangerous as discussed in Section 2.1.1. This site allows a multitude of different attack vectors, some more damaging than others. Figure 20 shows a successful login authentication bypass and gives the attacker access to the first account listed in the database; in this case "admin" simply by using the string `' OR 1=1--` as the user name.

![SQL injection on login form to bypass authentication](./assets/implementation/sql1.png){width=80%}

A slightly different attack vector is on the user profile page where parts of the URL are used in routing as parameters for queries. They are not sanitised before use which allows the string `admin' UNION SELECT 1,user,3,pass,5,5 FROM users--`, when used as a "username" selection, to return a complete list of all usernames and passwords. The second item in Figure 21 shows an "article" with its title being the password to the "admin" user.

![SQL injection in the URL bar to retrieve usernames and passwords](./assets/implementation/sql2.png){width=80%}

Other SQL injections can be used on the site in places where user input is accepted but most of the time the only potential is to cause a HTTP error 500. The damage potential is limited by the specific implementation of the SQLite package which does not seem to allow multiple commands to be given to a `get` or `run` function call.

SQLite also does not support subqueries so `DROP TABLE` commands can not be run at all. This would be an issue on systems using MySQL/PostgreSQL but there are enough examples in this project to teach injection prevention sufficiently.

### XSS Injection
XSS vulnerabilities are easy to discover and exploit on this site. They all take the same form of user data being pushed to the browser without proper sanitisation. Figure 22 shows a new article creation page with `<script>alert(123)</script>` as the title. Upon submitting the article and waiting for the page to redirect to the new article, a browser alert appears that says "123" (shown in Figure 23).

![Article create form with title including raw HTML script tags](./assets/implementation/xss1.png){width=80%}

![The result of the script execution on next page load](./assets/implementation/xss1.png){width=80%}

There are many opportunities to exploit this vulnerability. For example, if it were possible to sign up for a user account and there were sufficiently few restrictions on username, one could insert a XSS string as a username and have it be executed every time the username was inserted into the page.

There also exists a reflected XSS attack on the login page. Upon submitting an incorrect username and/or password, an error message will be inserted into the response that includes the username which can cause scripts to be run. Figure 24 shows the result of using `<script>alert(123)</script>` as a username.

![Using an XSS payload as an incorrect username](./assets/implementation/xss3.png){width=80%}

### CSRF
Section 4.2.3 and Section 5.3 adequately explain how the CSRF vulnerability is exploited in this system.

### Authorisation Issues
Figure 25 shows one of the many similar authorisation issues. Even though a user (anonymous or not) is not shown the edit button on an article page. It is still accessible via direct URL traversal. Note the "Login" item in the navigation bar indicating that the user is not logged in at all; editing an article definitely shouldn't be allowed in this case.

![Article edit page is accessible despite not being logged in](./assets/implementation/authorisation.png){width=80%}

### Password Storage
The password list retrieving SQL injection shown in section 5.4.1 demonstrated a secondary issue, that passwords are being stored in plain text. If database dumps like this are possible, it definitely should not be acceptable to store unencrypted passwords.

## Automatic Testing - Part 1
A test suite has been created for each of the issues tested in Section 5.4. As an example, Figure 26 shows the output from the SQL injection test suite with no fixes applied.

![Result of running SQL test suite before fixing vulnerabilities](./assets/implementation/test-prev.png){width=80%}

There are 5 commands available to test the vulnerabilities:

- `npm run test:sql` to test SQL injections
- `npm run test:xss` to test XSS injections
- `npm run test:csrf` to test CSRF
- `npm run test:auth` to test authorisation issues
- `npm run test:passwords` to test password storage

Appending `-- --fail-fast --watch` to the end of any (except XSS) tests will cause one error to appear at a time and also re-run the test suite after any file changes.

### SQL Injection

SQL injections are tested with a few different types of payloads: the database dump attack is tested with the same query string shown in Figure 21, all the article endpoints are given a single apostrophe to try and cause an SQLite error (which will cascade into an HTTP error 500), and the login page is tested with a the following payloads designed to bypass authentication:

1. `' OR 1=1--`
1. `' OR '1'='1`
1. `admin'--`

A complete list of the tests to be run follow:

- `user: profile => extract list of usernames and passwords`
- `articles: show => cause server error via SQL injection`
- `articles: create => cause server error via SQL injection`
- `articles: edit => cause server error via SQL injection`
- `articles: update => cause server error via SQL injection`
- `articles: remove => cause server error via SQL injection`
- `comments: create => cause server error via SQL injection`

### XSS
For XSS tests the following few payloads were selected and modified from the Big List of Naughty Strings repo on Github (see <https://github.com/minimaxir/big-list-of-naughty-strings>):

1. `<script>alert(123)</script>`
1. `<svg><script>123<1>alert(123)</script>"`
1. `\"><script>alert(123);</script x=\""`
1. `</script><script>alert(123)</script>"`
1. `< / script >< script >alert(123)< / script >"`
1. `<IMG \"\"\"><SCRIPT>alert(123)</SCRIPT>\">"`
1. `<img src=x onerror=alert(123) />"`
1. `<IMG SRC=\"javascript:alert(123)\""`
1. `<IMG SRC=\" &#20; javascript:alert(123);\">"`
1. `<sc<script>ript>alert(123)</sc</script>ript>`
1. `<a href=http://foo.bar/#x='y></a><img alt=\"'><img src=x:x onerror=javascript:alert(123)></a>\">"`
1. `<<SCRIPT>alert(123);//<</SCRIPT>"`

All payloads are designed to display an alert with the message "123".

Payloads 1-6 are first order attacks where script tags are included verbatim, each one attempts to escape out of strings/tags/scripts and execute it's payload. No. 5 tries to hide itself slightly by padding script tags with spaces which might possibly get stripped my some on-the-fly HTML minifier.

Payloads 7-9 are second order attacks where the script is not executed immediately but as a result of other markup being parsed. In no. 7, when the image src is parsed and the request for the image fails, the `onerror` handler is called.

Payloads 10-12 are third order attacks. They are modified versions of first or second order attacks that include ways of getting around naive script blockers. No. 10 is the same as no. 1 except there are additional `<script>` tags inserted in the middle of the other `<script>` tags. This is to create a valid XSS payload if a naive XSS detector stripped out strings matching `<script>`. The resulting string would be identical to no. 1 and would not be caught if the detector only did one loop though it's heuristics.

A complete list of the tests to be run follow:

- `XSS injection => article list`
- `XSS injection 1 => article title/body/comments`
- `XSS injection 1 => article title/body edit`
- `XSS injection 1 => user profile`
- `XSS injection 1 => login page reflection`
- `XSS injection 2 => article title/body/comments`
- `XSS injection 2 => article title/body edit`
- `XSS injection 2 => user profile`
- `XSS injection 2 => login page reflection`
- ...
- `XSS injection 12 => article title/body/comments`
- `XSS injection 12 => article title/body edit`
- `XSS injection 12 => user profile`
- `XSS injection 12 => login page reflection`

### CSRF
A complete list of the tests to be run follow:

- `user: login => without csrf token`
- `user: login => with csrf token`
- `user: incorrect login => without csrf token`
- `user: incorrect login => with csrf token`
- `article: create => without csrf token`
- `article: create => with csrf token`
- `article: update => without csrf token`
- `article: update => with csrf token`
- `comment: create => without csrf token`
- `comment: create => with csrf token`
- `article: delete => without csrf token`
- `article: delete => with csrf token`

### Authorisation Issues
A complete list of the tests to be run follow:

- `anonymous user => load new article page`
- `anonymous user => create article`
- `user => create articles as another via SQL injection`
- `user => comment as another via SQL injection`
- `user => load others articles edit page`
- `user => edit others articles`
- `user => edit others articles via SQL injection`
- `user => delete others articles`

### Password Storage
A complete list of the tests to be run follow:

- `user passwords are hashed`
- `plaintext passwords should not work`

## Fixing The Vulnerabilities
### SQL Injection
SQL injections are caused by unsanitised user input. The code snippet responsible for authenticating follows, where string concatenation is being used to insert the username and password into the query.

```js
const user = ctx.request.body.user
const pass = ctx.request.body.pass

const q = `
  SELECT * FROM users
  WHERE user='${user}'
  AND pass='${pass}'
`

const acc = await ctx.db.get(q)
```

The fix for the above code as well as all the other instances of query string concatenation throughout the codebase would be to use the well-supported (and almost universally understood) placeholder queries (using the ? syntax) and passing an array of the data as an additional parameter to the `get` method. Each item of the array will be sanitised and inserted into the query at each ? respective to their position in the array.

```js
const user = ctx.request.body.user
const pass = ctx.request.body.pass

const q = `
  SELECT * FROM users
  WHERE user=?
  AND pass=?
`

const acc = await ctx.db.get(q, [user, pass])
```
<!-- TODO: IS THIS ^^^^ OR ANYTHING ELSE HIDDEN -->

The complete sample solution is implemented in the `fix-sql-injection` branch.  
Run `git checkout fix-sql-injection` to view and test it.

### XSS Injection
XSS injections are caused by unsanitised user input being inserted back into a page from the server. The vulnerability had to be introduced purposefully in this project since HTML string escaping is the default behavior for the templating engine, Pug. Inserting data using the `=` sign after a tag name will sanitise the output. Most of the XSS opportunities are due to `!=` being used instead. A portion of the vulnerable article display template file follows:

```jade
div.article-body!= marked(article.body)
p.article-author
  a(href=`/user/${article.author}`)!= article.author
p.article-date!= articleDate(article.created_at)
```

To fix this, simply replace all the occurrences of `!=` with `=`. This causes all the tests to pass but breaks some of the desired functionality. The Markdown formatting now displays as escaped HTML tags in the output.

Since the markdown formatter, `marked`, is being passed to the view engine as a helper, an option needs to be set on its initialisation to disallow raw HTML passthrough but still compile the markdown code.

```js
marked.setOptions({
  sanitize: true
})
```

This means that `!=` can safely remain in places where marked is used but `=` should be used everywhere else. The XSS test suite still passes all its tests.

```jade
div.article-body!= marked(article.body)
p.article-author
  a(href=`/user/${article.author}`)= article.author
p.article-date= articleDate(article.created_at)
```

The complete sample solution is implemented in the `fix-xss` branch.  
Run `git checkout fix-xss` to view and test it.

### CSRF
CSRF vulnerabilities arise when open API endpoints are able to be used by other pages on behalf of a logged in user. The solution is to issue a unique token to each user for each API request they make.

For this project, fixing the vulnerability is very simple since the `koa-csrf` is installed and imported by default. There is a commented-out line in `server.js` that should be uncommented to enable the `koa-csrf` middleware. Every request that is not of type `GET`, `HEAD` or `OPTIONS` will be subject to the middleware's CSRF token checking.

```js
app.use(new CSRF())
```

This breaks most of the blog, though, since the site's own requests are not authorised by the middleware. All forms now need to have a hidden field added with a CSRF token inserted when the template is rendered. The code for the login form follows:

```jade
form(method="post").login
  label(for="user").login-user-label Username
  input(type="text" id="user" name="user" placeholder="Username").login-user

  label(for="pass").login-pass-label Password
  input(type="password" id="pass" name="pass" placeholder="Password").login-pass

  input(type="hidden" name="_csrf" value=csrf)

  input(type="submit" id="submit" value="Login").login-submit.button
```

Note the hidden input with name "\_csrf". On every page load throughout the site, a new token is generated and anywhere `=csrf` appears. This causes 403 errors to be shown whenever a token is not present in the request, such is the case with the malicious server.

The complete sample solution is implemented in the `fix-csrf` branch.  
Run `git checkout fix-csrf` to view and test it.

### Authorisation Issues
Authorisation issues are not caused specifically by some inaction of a developer. Authorisation may have been baked into a system as part of its requirements or by accident. To catch all the authorisation issues, it helps to have a consistent way to verify ownership of a resource and standardised error responses to identify bugs. The `edit`, `update` and `delete` handlers had their authorisation issues fixed by including the following snippet near the top of each method:

```js
const articleId = ctx.params.id

const { id } = verifyLogin(ctx)
const articleCheck = await ctx.db.get(`
  SELECT author_id
  FROM articles
  WHERE id = ?
`, [artideId])

if (!articleCheck) ctx.throw(400, 'article does not exist')
if (id !== articleCheck.author_id) ctx.throw(403, 'not your article')
```

An additional SELECT request is made to the database, before any destructive action is taken, and is checked against the logged in user's details. If the article doesn't exists throw an error. If it exists but doesn't belong to the user, throw a different error. (The error codes could be different, what matters is they are consistent across endpoints.)

Other smaller issues like anonymous users being able to post articles were solved by throwing an error if no login details were in a client's session storage.

The complete sample solution is implemented in the `fix-auth` branch.  
Run `git checkout fix-authorisation` to view and test it.

### Password Storage
Bad password storage is a problem when coupled with another vulnerability that allows database access. The only one in scope of this project is SQL injection while has allowed a database dump seen in Section 5.5.1. When using bcrypt, the industry standard password storage method today, it is not easy to hash the candidate password before querying the database. This code checks the username and plaintext password against the database:

```js
const user = ctx.request.body.user
const pass = ctx.request.body.pass

const q = `
  SELECT * FROM users
  WHERE user='${user}'
  AND pass='${pass}'
`

const acc = await ctx.db.get(q)

if (acc) {
  // login accepted
}
```

Passwords generated with bcrypt have the following form:

```
$2a$12$iLUhLbtzzQV2c56OH2WT9uCr4QBY/lichyyACVvtbSA7mcR9uu/fS
```

The password salt is generated in a secure random fashion when hashing with bcrypt and is stored with the hashed password itself, in the same field. Therefore, when authenticating, the database query is made first without using the password parameter. The plaintext password is passed to bcrypt's `compare` method which abstracts the implementation but returns true if the given string is the same string that was hashed and put in the database. The implementation changes are like so:

```js
// top of file...
const bcrypt = require('bcryptjs')

// authenticate method...
const user = ctx.request.body.user
const pass = ctx.request.body.pass

const q = `
  SELECT * FROM users
  WHERE user=?
`

const acc = await ctx.db.get(q, [user])

if (acc && await bcrypt.compare(pass, acc.pass)) {
  // login accepted
}
```

To provide simplicity to the user when changing the password system over to use bcrypt, there are secure variants of both users: "admin" and "user", "admin_secure" and "user_secure" that have pre-hashed passwords equivalent to their original. So "admin_secure" can still log in with the password `nimda`.

The complete sample solution is implemented in the `fix-passwords` branch.  
Run `git checkout fix-passwords` to view and test it.

## Automatic Testing - Part 2

Now that the code has been patched for each of the five types of vulnerability, the test suites can be re-run for each type. Changing to the `fix-sql-injection` branch and running `npm run test:sql` will now show all the tests passing (Figure 27). (Note: the `BadRequestError` is expected.)

![Result of running SQL test suite after fixing the vulnerabilities](./assets/implementation/test-post.png){width=100%}

After merging all the fix branches into master in the order `sql`, `xss`, `csrf`, `authorisation`, `passwords`

\pagebreak
