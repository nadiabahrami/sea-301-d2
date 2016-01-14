(function(module) {
  function Article (opts) {
    // DONE: Convert property assignment to Functional Programming style. Now, ALL properties of `opts` will be
    // assigned as properies of the newly created article object.
    Object.keys(opts).forEach(function(e, index, keys) {
      this[e] = opts[e];
    },this);
  }

  Article.all = [];

  Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  // *DONE: Set up a DB table for articles.
  Article.createTable = function(callback) {
    webDB.execute(
      'CREATE TABLE IF NOT EXISTS ipsumArticles(title VARCHAR(50), author VARCHAR(50), category VARCHAR(50), authorUrl VARCHAR(50), publishedOn VARCHAR(10), body VARCHAR(10));',
      function(result) {
        console.log('Successfully set up the articles table.', result);
        if (callback) callback();
      }
    );
  };

  // DONE: Correct the SQL to delete all records from the articles table.
  Article.truncateTable = function(callback) {
    console.log("You are deleting stuff with Truncate");
    webDB.execute(
      'DELETE FROM ipsumArticles;',
      callback
    );
  };


  // DONE: Insert an article instance into the database:
  Article.prototype.insertRecord = function(callback) {
    console.log("You are in insertrecords");
    webDB.execute(
      [
        {
          'sql': 'INSERT INTO ipsumArticles(title, author, authorUrl, publishedOn, category, body) VALUES(?,?,?,?,?,?);',
          'data': [this.title, this.author, this.authorUrl, this.publishedOn, this.category, this.body],
        }
      ],
      callback
    );
  };

  // DONE: Delete an article instance from the database:
  Article.prototype.deleteRecord = function(callback) {
    webDB.execute(
      [
        {
          // 'sql': 'DELETE FROM ipsumArticles WHERE '+ "'"+callback+"'"+'=(title, author, authorUrl, publishedOn, category, body) VALUES(?,?,?,?,?,?);',
          // 'data': [this.title, this.author, this.authorUrl, this.publishedOn, this.category, this.body],
          'sql': 'DELETE FROM ipsumArticles WHERE id = ?;',
          'data': [this.id],
        }
      ],
      callback
    );
  };

  // TODO: Update an article instance, overwriting it's properties into the corresponding record in the database:
  Article.prototype.updateRecord = function(callback) {
    webDB.execute(
      [
        {
          'sql': 'UPDATE ipsumArticles SET title = ?, author = ?, authorUrl = ?, publishedOn = ?, category = ?, body = ?;',
          'data': [this.title, this.author, this.authorUrl, this.publishedOn, this.category, this.body],
        }
      ],
      callback
    );
  };

  // DONE: Refactor to expect the raw data from the database, rather than localStorage.
  Article.loadAll = function(rows) {
    Article.all = rows.map(function(ele) {
      return new Article(ele);
    });
  };

  // DONE: Refactor this to check if the database holds any records or not. If the DB is empty,
  // we need to retrieve the JSON and process it.
  // If the DB has data already, we'll load up the data (sorted!), and then hand off control to the View.
  Article.fetchAll = function(next) {
    webDB.execute('Select * FROM ipsumArticles ORDER BY title ASC', function(rows) {
      if (rows.length) {
        // Now instanitate those rows with the .loadAll function, and pass control to the view.
        Article.loadAll(rows);
        next();
      } else {
        $.getJSON('/data/hackerIpsum.json', function(rawData) {
          // Cache the json, so we don't need to request it next time:
          rawData.forEach(function(item) {
            var article = new Article(item); // Instantiate an article based on item from JSON
            // Cache the newly-instantiated article in DB:
            article.insertRecord();

          });
          // Now get ALL the records out the DB, with their database IDs:
          webDB.execute('SELECT * FROM ipsumArticles ORDER BY title ASC', function(rows) {
            // Now instanitate those rows with the .loadAll function, and pass control to the view.
            Article.loadAll(rows);
            next();

          });
        });
      }
    });
  };

  Article.allAuthors = function() {
    return Article.all.map(function(article) {
      return article.author;
    })
    .reduce(function(names, name) {
      if (names.indexOf(name) === -1) {
        names.push(name);
      }
      return names;
    }, []);
  };

  Article.numWordsAll = function() {
    return Article.all.map(function(article) {
      return article.body.match(/\b\w+/g).length;
    })
    .reduce(function(a, b) {
      return a + b;
    });
  };

  Article.numWordsByAuthor = function() {
    return Article.allAuthors().map(function(author) {
      return {
        name: author,
        numWords: Article.all.filter(function(a) {
          return a.author === author;
        })
        .map(function(a) {
          return a.body.match(/\b\w+/g).length
        })
        .reduce(function(a, b) {
          return a + b;
        })
      }
    })
  };

  Article.stats = function() {
    return {
      numArticles: Article.all.length,
      numWords: Article.numwords(),
      Authors: Article.allAuthors(),
    };
  }

  module.Article = Article;
})(window);
