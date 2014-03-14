module.exports = function (grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        watch: {
            js: {
                files: ["gruntfile.js", "server.js", "app/**/*.js", "public/js/**"],
                tasks: ["jshint", "concat"],
                options: {
                    livereload: 3333
                }
            },
            html: {
                files: ["public/views/**", "app/views/**"],
                options: {
                    livereload: 3333
                }
            },
            css: {
                files: ["public/css/**"],
                options: {
                    livereload: 3333
                }
            }
        },
        jshint: {
            all: {
                src: ["gruntfile.js", "server.js", "app/**/*.js", "public/js/**"],
                options: {
                    jshintrc: true
                }
            }
        },
        env: {
            test: {
                NODE_ENV: "test"
            }
        },

        nodemon: {
            dev: {
                script: "server.js",
                options: {
                    args: [],
                    ignore: ["public/**", "bower_components", "node_modules"],
                    ext: "js",
                    nodeArgs: ["--debug"],
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },

        concurrent: {
            tasks: ["nodemon", "watch"],
            options: {
                logConcurrentOutput: true
            }
        },

        concat: {
            dist: {
                src: [
                    "public/js/app.js",
                    "public/js/services/**/*.js",
                    "public/js/controllers/**/*.js",
                    "public/js/filters/**/*.js"
                ],
                dest: "public/final.js"
            }
        }
    });


    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-nodemon");
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-env");

    grunt.option("fource", true);

    grunt.registerTask("default", ["jshint", "concurrent"]);
};