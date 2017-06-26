// See http://brunch.io for documentation.
module.exports = {
    files: {
	javascripts: {joinTo: 'app.js'},
	stylesheets: {joinTo: 'app.css'}
    },

    paths: {
	watched: ["elm"],
	public: '../static/'
    },

    plugins: {
	elmBrunch: {
            // (required) Set to the elm file(s) containing your "main" function `elm make` 
            //            handles all elm dependencies relative to `elmFolder`
            mainModules: ["elm/Main.elm"],
	    outputFolder: 'public',
	    outputFile: 'index.html'	    
	}
    }
};
