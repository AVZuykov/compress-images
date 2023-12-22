import gulp from 'gulp'
import imagemin, { mozjpeg, optipng } from 'gulp-imagemin'
import imageminWebp from 'imagemin-webp'

export default () =>
  gulp
    .src('src/*')
    .pipe(
      imagemin([
        mozjpeg({ quality: 75, progressive: true }),
        optipng({ optimizationLevel: 5 }),
        imageminWebp({ quality: 50 }),
      ])
    )
    .pipe(gulp.dest('dist'))
