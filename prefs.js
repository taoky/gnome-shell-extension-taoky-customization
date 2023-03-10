'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext;
const Domain = Gettext.domain(Me.metadata.uuid);
const _ = Domain.gettext;


function init() {
}

function addBooleanRow(settings, title, name, group, subtitle = null) {
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
    if (subtitle) {
        row.subtitle = subtitle;
    }
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.taoky-customization');
    
    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group_startup = new Adw.PreferencesGroup();
    group_startup.set_title(_('On extension startup'));
    page.add(group_startup);

    addBooleanRow(settings, _('Disable unredirection'), 'disable-unredirect', group_startup);
    addBooleanRow(settings, _('Disable xwayland pointer gestures'), 'disable-xwayland-pointer-gestures', group_startup);
    addBooleanRow(settings, _('Disable minimize animation'), 'disable-minimize-animation', group_startup);

    const group_misc = new Adw.PreferencesGroup();
    group_misc.set_title(_('Miscellaneous'));
    page.add(group_misc);

    addBooleanRow(settings, _('Monkey patch unredirection functions'),
        'monkey-patch-unredirect', group_misc, _("Monkey-patch Meta.enable_unredirect_for_display() and Meta.disable_unredirect_for_display() to no-op. This will only take effect on the next extension startup."));

    // Add our page to the window
    window.add(page);
}

