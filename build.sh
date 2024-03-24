#!/bin/sh -e

glib-compile-schemas schemas/
xgettext --from-code=UTF-8 --output=po/gnome-custom.pot *.js
gnome-extensions pack --podir=po .
