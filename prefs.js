import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


function addBooleanRow(settings, title, name, group, subtitle = null) {
    const row = new Adw.ActionRow({title});
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
    if (subtitle)
        row.subtitle = subtitle;
}

export default class MyExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Use the same GSettings schema as in extension.js
        const settings = this.getSettings(
            'org.gnome.shell.extensions.taoky-customization');

        // Create a preferences page and group
        const page = new Adw.PreferencesPage();
        const group_startup = new Adw.PreferencesGroup();
        group_startup.set_title(_('On extension startup'));
        page.add(group_startup);

        addBooleanRow(settings, _('Disable unredirection'), 'disable-unredirect', group_startup);
        addBooleanRow(settings, _('Disable xwayland pointer gestures'), 'disable-xwayland-pointer-gestures', group_startup);
        addBooleanRow(settings, _('Disable minimize animation'), 'disable-minimize-animation', group_startup);

        const group_stop = new Adw.PreferencesGroup();
        group_stop.set_title(_('On extension stop'));
        page.add(group_stop);

        // addBooleanRow(settings, _('Don\'t enable unredirect on extension stop'), 'dont-enable-unredirect-on-extension-stop', group_stop, _("Enabling unredirection on extension stop may leak window info after locking screen in multi-screen system."));

        const group_misc = new Adw.PreferencesGroup();
        group_misc.set_title(_('Miscellaneous'));
        page.add(group_misc);

        // addBooleanRow(settings, _('Monkey patch unredirection functions'),
        //     'monkey-patch-unredirect', group_misc, _("Monkey-patch Meta.enable_unredirect_for_display() and Meta.disable_unredirect_for_display() to no-op. This will only take effect on the next extension startup."));

        // Add our page to the window
        window.add(page);
    }
}
