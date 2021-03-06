module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
        scripts: {
            files: ['src/*.js', "test/*.js", "intervalsJS.js", "src/Types/*.js"],
            tasks: ['docs', 'default'],
        }
    },
    jshint: {
        all: ['Gruntfile.js', 'src/*.js', 'test/*.js', 'intervalsJS.js', "src/Types/*.js"],
        options: {
            esversion: 6
        }
    },
    jsdoc: {
        dist: {
            src: ['src/*.js', 'src/_utils.js', 'src/Types/*.js'],
            options: {
                destination: 'docs',
                template: 'node_modules/docdash',
                readme: 'README.md'
            }
        }
    },
    mocha_istanbul: {
        coverage: {
            src: 'test'
        }
    },
    eslint: {
        src: ["src/*.js", "intervalsJS.js", "src/Types/*.js"]
    },

    'gh-pages': {
      options: {
        base: 'docs'
      },
      src: ["**/*"]
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("gruntify-eslint");
  grunt.loadNpmTasks('grunt-gh-pages');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'eslint', 'mocha_istanbul']);
  grunt.registerTask('publishDocs', ['jsdoc', 'gh-pages']);
  grunt.registerTask('docs', ['jsdoc']);

};
