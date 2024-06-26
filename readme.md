# Compress Images

Этот проект призван оптимизировать конвертацию и минификацию векторных и растровых изображений.

Проект работает на Gulp с небольшими самописными плагинами использующие [svgo](https://github.com/svg/svgo) и [sharp.](https://github.com/lovell/sharp) Это позволяет добиться большей гибкости в настройке и скорости работы.

Также спользуется Gulp watcher для отслеживания изменеий в файлах.

## Настройка для своего проекта

В первую очередь установите все требуемые зависимости

```bash
npm i
```

Отредактируйте переменные среды для в соответсвии с вашими требованиями, это можно сделать в файле .env в корне проекта.

Для запуска отслеживания измений файлов и их автоматической оптимизиации достаточно запустить дефолтную таску при помощи команды:

```bash
gulp
```

_Если gulp установлен глобально_

или

```bash
npm run compress
```
