/**
 * grunt-pagespeed-ngrok
 * http://www.jamescryer.com/grunt-pagespeed-ngrok
 *
 * Copyright (c) 2014 James Cryer
 * http://www.jamescryer.com
 */


'use strict';

var ngrok = require('ngrok');

module.exports = function(grunt) {

    // Load grunt tasks
    require('load-grunt-tasks')(grunt);

    // Grunt configuration
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        /** Setup tasks **/

        /** JavaScript **/

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                }
            },

            uses_defaults: ['src/**/*.js'], //, 'src/**/*.js'],

            with_overrides: {
                options: {
                    curly: false,
                    undef: true
                },
                files: {
                    src: ['src/**/*.js', 'src/**/*.js']
                }
            },

            beforeconcat: ['src/static/scripts/perfmatters.js', 'src/static/scripts/app.js'],
            afterconcat: ['src/static/scripts/perfmatters.concat.js']
        },

        /* Concat */
        concat: {
            js: {
                src: [ 'src/static/scripts/**/*.js'],
                dest: '../dist/combined.js',
                options: {
                    separator: ';'
                }
            }
        },

        codekit: {
            build: {
                files: {
                    'src/static/scripts/perfmatters.concat.js':
                        ['src/static/scripts/perfmatters.js', 'src/static/scripts/app.js']
                }
            }
        },

        uglify: {
            options: {
                sourceMap: false
            },
            build: {
                src: 'src/static/scripts/perfmatters.concat.js',
                dest: 'dist/static/scripts/perfmatters.min.js'
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true
                },
                files: {
                    'dist/index.html': 'src/index.html',
                    'dist/project-2048.html': 'src/project-mobile.html',
                    'dist/project-mobile.html': 'src/project-mobile.html',
                    'dist/project-webperf.html': 'src/project-webperf.html'
                }
            },
            dev: {
                files: {
                    'dist/index.html': 'src/index.html',
                    'dist/project-mobile.html': 'src/project-mobile.html',
                    'dist/project-webperf.html': 'src/project-webperf.html'
                }
            }
        },


        /** CSS **/

        sass: {
            build: {
                options: {
                    //outputStyle: 'compressed',
                    sourceMap: false
                },
                files: [{
                    expand: true,
                    cwd: 'src/static/styles/',
                    src: ['style.scss', 'print.scss', 'under480.scss'],
                    dest: 'dist/static/styles/before-prefix',
                    ext: '.css'
                }]
            }
        },

        autoprefixer: {
            options: {
                //browsers: ['last 2 versions', 'ie 8', 'ie 9', '> 1%'],
                browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
            },
            main: {
                expand: true,
                flatten: true,
                src: 'dist/static/styles/before-prefix/*.css',
                dest: 'dist/static/styles/after-prefix/'
            }
        },

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'dist/static/styles/before-prefix',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dist/static/styles',
                    ext: '.min.css'
                }]
            }
        },

        uncss: {
            dist: {
                options: {
                    ignore: [/js-.+/, '.special-class'],
                    ignoreSheets: [/fonts.googleapis/]
                },
                files: {
                    'dist/static/styles/unused-removed.css': ['http://localhost:8080/nano/index.html'] //, 'src/project-2048.html', 'src/project-mobile.html', 'src/project-webperf.html']
                }
            }
        },

        /** Images **/

        responsive_images: {
            dev: {
                options: {
                    engine: 'im',
                    sizes: [
                        {
                            name: 'small',
                            width: 100,
                            quality: 60
                        },
                        {
                            name: 'medium',
                            width: 512,
                            quality: 60
                        },
                        {
                            name: 'large',
                            width: 1024,
                            quality: 50
                        },
                        {
                            name: 'large-2x',
                            width: 2048,
                            quality: 40
                        }
                    ]
                },

                /*
                 You don't need to change this part if you don't change
                 the directory structure.
                 */
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'src/static/img_src/resp/pizza',
                    dest: 'src/static/images/pizza'
                },
                {
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'src/static/img_src/resp',
                    dest: 'src/static/images'

                }]
            }
        },

        imageoptim: {
            options: {
                jpegMini: true,
                imageAlpha: false,
                imageOptim: true,
                quitAfter: true
            },
            build: {
                src: [
                    'dist/**/*.png',
                    'dist/**/*.jpg',
                    'dist/**/*.gif'
                ]
            }
        },

        /* Clear out the images directory if it exists */
        clean: {
            img: {
                src: ['src/static/images/']
            },
            pub: ['public/'],
            dist: ['dist/'],
            concatenatedjsfile: ["src/static/scripts/perfmatters.concat.js"],
            beforeprfixedcssfile: ["dist/static/styles/before-prefix"],
            afterprfixedcssfile: ["dist/static/styles/after-prefix"]
        },

        /* Generate the images directory if it is missing */
        mkdir: {
            img: {
                options: {
                    create: ['src/static/images']
                }
            }
        },

        /* Copy the "fixed" images that don't go through processing into the images/directory */
        copy: {
            img: {
                files: [{
                    expand: true,
                    src: 'src/static/img_src/fixed/*.{gif,jpg,png}',
                    dest: 'src/static/images/',
                    flatten: true
                }]
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: [
                        '**',
                        '!static/img_src/**',
                        '!static/scripts/**',
                        '!static/scripts/**/*.js',
                        '!static/styles/**/*.scss'
                    ],
                    dest: 'dist/'
                }]
            },

            serviceWorker: {
                files:[{
                    expand: true,
                    cwd: 'src/',
                    src: [
                        'static/scripts/third_party/serviceworker-cache-polyfill.js',
                        'static/service-worker.js'
                    ],
                    dest: 'dist/'
                }]
            },

            html: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: [
                        '**/*.html'
                    ],
                    dest: 'dist/'
                }]
            }
        },

        // make a zipfile
        compress: {
            zip: {
                options: {
                    archive: 'archive.zip'
                },
                files: [
                    {src: ['path/*'], dest: 'internal_folder/', filter: 'isFile'}, // includes files in path
                    {src: ['path/**'], dest: 'internal_folder2/'}, // includes files in path and its subdirs
                    {expand: true, cwd: 'path/', src: ['**'], dest: 'internal_folder3/'}, // makes all src relative to cwd
                    {flatten: true, src: ['path/**'], dest: 'internal_folder4/', filter: 'isFile'} // flattens results to a single level
                ]
            },
            gzip: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'dist/',
                src: ['**/*'],
                dest: 'public/'
            },
            custom: {
                options: {
                    mode: 'gzip'
                },
                files: [
                    // Each of the files in the src/ folder will be output to
                    // the dist/ folder each with the extension .gz.js
                    {expand: true, src: ['dist/**/*.js'], dest: 'public/', ext: '.gz.js'}
                ]
            }
        },

        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            build: {
                tasks: ['watch:notjsorcss', 'watch:js', 'watch:scss']
            }
        },

        watch: {
            notjsorcss: {
                files: [
                    'src/**/*.*',
                    '!src/scripts/*.*',
                    '!src/styles/*.*'
                ],
                tasks: ['copy:html']
            },
            js: {
                files: [
                    'src/static/scripts/**/*.js',
                    '!src/static/scripts/perfmatters.concat.js'
                ],
                tasks: ['codekit', 'uglify', 'copy:serviceWorker']
            },
            scss: {
                files: ['src/static/styles/**/*.scss'],
                tasks: ['sass']
            }
        },

        pagespeed: {
            options: {
                nokey: true,
                locale: "en_GB",
                threshold: 40

            },
            local: {
                options: {
                    strategy: "desktop"
                }
            },
            mobile: {
                options: {
                    strategy: "mobile"
                }
            }
        }


    });


    // Register customer task for ngrok
    grunt.registerTask('psi-ngrok', 'Run pagespeed with ngrok', function() {
        var done = this.async();
        var port = 8080;//9292;

        ngrok.connect(port, function(err, url) {
            if (err !== null) {
                grunt.fail.fatal(err);
                return done();
            }
            grunt.config.set('pagespeed.options.url', url);
            grunt.task.run('pagespeed');
            done();
        });
    });

    // Register default tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-codekit');
    grunt.loadNpmTasks('grunt-imageoptim');
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-criticalcss');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');


    grunt.registerTask('resp', ['clean:img', 'mkdir:img', 'copy:img', 'responsive_images']);

    grunt.registerTask('js', [
        'jshint:uses_defaults',
        'codekit',
        'jshint:afterconcat',
        'uglify',
        'clean:concatenatedjsfile']);

    grunt.registerTask('css', [
        'sass',
        'autoprefixer',
        'cssmin',
    ]);

    grunt.registerTask('cleanup', [
        'clean:concatenatedjsfile',
        'clean:beforeprfixedcssfile',
        'clean:afterprfixedcssfile'
    ]);

    grunt.registerTask('fileonly', [
        'clean:dist',
        'clean:pub',
        'copy',
        'js',
        'css',
        'htmlmin:dist',
        'cleanup'
    ]);


    grunt.registerTask('test', [
        'clean:dist',
        'clean:pub',
        'copy',
        'js',
        'css',
        'htmlmin:dist',
        'cleanup',
        'imageoptim',
        'compress:gzip'
    ]);


    grunt.registerTask('dev', [
        'clean:dist',
        'copy',
        'codekit',
        'uglify',
        'htmlmin:dist',
        'clean:concatenatedjsfile',
        'sass',
        'concurrent']);

    grunt.registerTask('full', [
        'clean:dist',
        'copy',
        'codekit',
        'uglify',
        'htmlmin:dist',
        'cleanup',
        'sass',
        'imageoptim',
        'compress:gzip'
    ]);
        //'usebanner']);
    //grunt.registerTask('default', ['psi-ngrok']);
}
