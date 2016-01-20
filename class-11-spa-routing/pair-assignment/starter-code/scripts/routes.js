// DONE: Configure routes for this app with page.js, by registering each URL your app can handle,
// linked to a a single controller function to handle it:

// DONE: What function do you call to activate page.js? Fire it off now, to execute

page.base('/');

page('', index);
page('about', about);
page('*', notFound);

page();

function index() {
  articlesController.index();
}

function about() {
  aboutController.index();
}

function notFound() {
  alert('Page not found. Please re-type your URL. KTHANKS.');
}
