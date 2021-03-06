var URL = require('url');
var chalk = require('chalk');
/**
 * tasker takes a record & creates more tasks - method is synchronous (but fast)
 * @param {Object} data - the scraped data from a GitHub page
 * @returns {Array} tasks - the list of newly created tasks
 */
 module.exports = function tasker (data) {
   if(!data.url) { // short circuit if no url is set
     return [];
   }
   var uri = URL.parse(data.url);
   var tasks = [], username, org, repo, url;
   // only scrape followers page if the person has non-zero followers:
   if(data.followercount > 0) {
     tasks.push(data.url+'/followers');
   }

   // if the person is follwing others, we grab that list
   if(data.followingcount > 0){
     tasks.push(data.url+'/following');
   }

   // if the page we have scraped is a following page
   if(data.url.match(/following/) && data.entries.length > 0){
     data.entries.forEach(function(e){
       tasks.push('/'+e);
     })
   }

   // if the page we have scraped is a following or followers page
   if(data.url.match(/followers/) && data.entries.length > 0){
     data.entries.forEach(function(e){
       tasks.push('/'+e);
     })
   }

   // if the person has starred any repos, we grab the list
   if(data.starred > 0) {
     username = data.url.substr(data.url.lastIndexOf('/') + 1);
     url = '/stars/'+username;
     tasks.push(url);
   }
   // scrape each organisation listed on the person's profile:
   if(data.orgs && data.orgs.length > 0) {
     data.orgs.map(function(org){

       url = org.split(' ')[0];

       tasks.push(url);
     });
   }

   // next_page
   if(data.next_page) {
     tasks.push(data.next_page);
   }

   // add task to scrape each entry in repositories
   if(data.url.match(/tab=repositories/) && data.entries.length > 0) {
     data.entries.map(function(repo){
       tasks.push(repo.url);
     })
   }
   // organisation repos:
   if(data.pcount && data.entries.length > 0) {
     console.log(' - - - - - - - - - - tasker org:')
     console.log(uri);
     console.log(' - - - - - - - - - - - - - - - - ')
     org = uri.path.substr(uri.path.lastIndexOf('/') + 1);
     var q = org.indexOf('?');
     if(q > -1){
       org = org.slice(0, q);
     }
     else { // only add task for list of people once
        url = "/orgs/" + org + "/people";
        tasks.push(url);
     }
     data.entries.map(function(repo) {
       tasks.push('/' + org + '/' + repo.name);
       console.log('Tasker: '+ chalk.bgCyan.black('/' + org + '/' + repo.name))
     })
   }



   // if the repo has stars lets grab the list of stargazers
   if(data.stars > 0) {
     tasks.push(data.url + '/stargazers');
     tasks.push(data.url + '/issues');
     tasks.push(data.url + '/labels');
     tasks.push(data.url + '/milestones');
   }

   return tasks;
 }
