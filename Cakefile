fs              = require 'fs'
{exec, spawn}   = require 'child_process'
baker           = require 'baker'

baker.open 'gedit', [
    'src'
    'public/index.html'    
]



baker.watch '.coffee', ['src', '!src/public'], (source) -> "coffee -o ./ #{ source }"
baker.watch '.coffee', ['src/public'], (source) -> "coffee -o ./public/scripts #{ source }"
baker.watch '.sass', ['src'], (source) -> "compass compile"

option '-l', '--list', 'list all target liles'

        
task 'open', 'open files', (options) ->
    if options.list
        baker.listOpen()
    else
        baker.execOpen()
        
task 'build', 'build everything', (options) ->
    if options.list
        baker.listBuild()
    else
        baker.execBuild()
        
task 'watch', 'watch and build everything', (options) ->
    if options.list
        baker.listWatch()
    else
        baker.execWatch()
