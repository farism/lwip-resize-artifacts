var gulp = require('gulp');
var rename = require('gulp-rename');
var sprite = require('css-sprite').stream;
var through2 = require('through2');
var lwip = require('lwip');
var sequence = require('run-sequence');

gulp.task('sprite', function(cb){
  return gulp.src('src/*.png')
    .pipe(sprite({
      name: 'sprite',
      retina: true,
      margin: 2,
      orientation: 'binary-tree',
      prefix: ''
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('lwip-background', function(cb){
  return gulp.src('build/sprite@2x.png')
    .pipe(through2.obj(function (chunk, enc, callback) {
      var pipe = this;
      lwip.open(chunk.contents, 'png', function(err, img){
        lwip.create(img.width(), img.height(), 'white', function(err, img2){
          img2.paste(0, 0, img, function(err, img){
            img.scale(0.5, function(err, img){
              img.toBuffer('png', function(err, buffer){
                chunk.contents = buffer;
                pipe.push(chunk);
                callback();
              });
            });
          });
        });
      });
    }))
    .pipe(rename(function(path){
      path.basename = 'lwip-background';
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('lwip-transparent', function(cb){
  return gulp.src('build/sprite@2x.png')
    .pipe(through2.obj(function (chunk, enc, callback) {
      var pipe = this;
      lwip.open(chunk.contents, 'png', function(err, img){
        img.scale(0.5, function(err, img){
          img.toBuffer('png', function(err, buffer){
            chunk.contents = buffer;
            pipe.push(chunk);
            callback();
          });
        });
      });
    }))
    .pipe(rename(function(path){
      path.basename = 'lwip-transparent';
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('build', function(cb){
  sequence('sprite', 'lwip-background', 'lwip-transparent', cb);
})

gulp.task('default', ['build'], function(){});