'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext;
const Domain = Gettext.domain(Me.metadata.uuid);
const _ = Domain.gettext;


function init() {
}

function addBooleanRow(settings, title, name, group) {
    const row = new Adw.ActionRow({ title });
    group.add(row);

    const toggle = new Gtk.Switch({
        active: settings.get_boolean(name),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        name,
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    row.add_suffix(toggle);
    row.activatable_widget = toggle;
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.taoky-customization');
    
    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    group.set_title(_('On extension startup'));
    page.add(group);

    addBooleanRow(settings, _('Disable unredirection'), 'disable-unredirect', group);
    addBooleanRow(settings, _('Disable xwayland pointer gestures'), 'disable-xwayland-pointer-gestures', group);
    addBooleanRow(settings, _('Disable minimize animation'), 'disable-minimize-animation', group);

    // Add our page to the window
    window.add(page);
}

