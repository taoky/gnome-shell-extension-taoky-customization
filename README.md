# gnome-shell-extension-taoky-customization

Customize GNOME for my personal usage

Support: GNOME 43

## What does it do?

- Disable unredirection (`Meta.disable_unredirect_for_display(global.display);`) to workaround a flickering bug with extensions like dash-to-dock, dash-to-panel.
- Disable xwayland pointer gestures for wine apps (See <https://bugs.winehq.org/show_bug.cgi?id=53114>, <https://gitlab.gnome.org/GNOME/mutter/-/issues/2353>)
- Disable minimize animation (it does not work well with dash-to-dock)
- Configurable with preferences window in Extensions.

## Notes

- `meta_compositor_is_unredirect_inhibited()` is private method of Meta so extensions cannot get the value of `disable_unredirect_count`.
- Currently minimize animation is controlled by `MINIMIZE_WINDOW_ANIMATION_TIME` in `js/ui/windowManager.js` in gnome-shell (Default = 400). This may change in future versions of GNOME.
- When running full-screen games, unredirection may be enabled again. If this happens you can try enabling the monkey patch option in the preferences window. It rewrites unredirection methods in gnome-shell JS layer to no-op.

### Dev notes

- `glib-compile-schemas schemas/` to compile schemas after updating the xml file
- `xgettext --from-code=UTF-8 --output=po/example.pot *.js` to generate pot (po template) file
