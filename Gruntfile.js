module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
	imagemin: {
		dynamic: {
			files: [{
				expand: true,
				cwd: 'public/images/site_image/home_page_slider/',
				src: ['**/*.{png,jpg,gif}'],
				dest: 'public/images/site_image/'
			}]
		}
	},
	
	 responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            width: 1600,
            suffix: '_large_2x',
            quality: 30
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'public/images/site_image/home_page_slider/',
          dest: 'public/images/site_image/responsive_images/'
        }]
      }
    }

    });

grunt.loadNpmTasks('grunt-contrib-imagemin');
 grunt.loadNpmTasks('grunt-responsive-images');
grunt.registerTask('default', ['imagemin','responsive_images']);

};