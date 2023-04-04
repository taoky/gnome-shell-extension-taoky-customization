/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const { Meta, Gio, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const WindowManager = imports.ui.windowManager;

function runCommand(cmd, comment) {
    let res = GLib.shell_parse_argv(cmd);
    let success = res[0];
    let argv = res[1];
    if (!success) {
        logError(`Glib.shell_parse_argv cannot parse cmd: ${cmd}`);
    } else {
        let proc = Gio.Subprocess.new(argv, Gio.SubprocessFlags.NONE);
        proc.wait_check_async(null, (proc, result) => {
            try {
                if (proc.wait_check_finish(result)) {
                    log (`${comment} successfully executed`);
                } else {
                    logError (`the process to execute the ${comment} failed`);
                }
            } catch (e) {
                logError(e);
            }
        });
    }
}

class Extension {
    constructor() {
        this.disable_unredirect_count = 0;
        this.executed_xwayland_pointer_gestures_disable = false;
        this.MINIMIZE_WINDOW_ANIMATION_TIME = null;
        this.meta_enable_unredirect_for_display = null;
        this.meta_disable_unredirect_for_display = null;
    }

    enable() {
        this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.taoky-customization');
        if (this.settings.get_value("disable-unredirect").get_boolean()) {
            log ("Disabling unredirect for global display");
            Meta.disable_unredirect_for_display(global.display);
            this.disable_unredirect_count += 1;
        }
        if (this.settings.get_value("disable-xwayland-pointer-gestures").get_boolean()) {
            log ("Disabling xwayland pointer gestures");
            runCommand("sh -c 'xinput list --name-only | grep ^xwayland-pointer-gestures | xargs -n1 xinput disable'", "xwayland pointer gestures disable");
            this.executed_xwayland_pointer_gestures_disable = true;
        }
        if (this.settings.get_value("disable-minimize-animation").get_boolean()) {
            log ("Disabling minimize animation");
            this.MINIMIZE_WINDOW_ANIMATION_TIME = WindowManager.MINIMIZE_WINDOW_ANIMATION_TIME;
            WindowManager.MINIMIZE_WINDOW_ANIMATION_TIME = 0;
        }
        if (this.settings.get_value("monkey-patch-unredirect").get_boolean()) {
            log ("Monkey patching Meta.enable_unredirect_for_display and Meta.disable_unredirect_for_display");
            this.meta_enable_unredirect_for_display = Meta.enable_unredirect_for_display;
            Meta.enable_unredirect_for_display = function() {
                // Avoid spamming log
                // log ("Calling Meta.enable_unredirect_for_display() as no-op.");
            }
            this.meta_disable_unredirect_for_display = Meta.disable_unredirect_for_display;
            Meta.disable_unredirect_for_display = function() {
                // Avoid spamming log
                // log ("Calling Meta.disable_unredirect_for_display() as no-op.");
            }
        }
    }

    disable() {
        if (this.meta_enable_unredirect_for_display !== null) {
            log ("Restoring Meta.enable_unredirect_for_display");
            Meta.enable_unredirect_for_display = this.meta_enable_unredirect_for_display;
        }
        if (this.meta_disable_unredirect_for_display !== null) {
            log ("Restoring Meta.disable_unredirect_for_display");
            Meta.disable_unredirect_for_display = this.meta_disable_unredirect_for_display;
        }
        if (this.settings.get_value("dont-enable-unredirect-on-extension-stop").get_boolean()) {
            this.disable_unredirect_count -= 1;
        }
        for (let i = 0; i < this.disable_unredirect_count; i++) {
            log ("Enabling unredirect for global display");
            Meta.enable_unredirect_for_display(global.display);
        }
        this.disable_unredirect_count = 0;
        if (this.executed_xwayland_pointer_gestures_disable) {
            log ("Enabling xwayland pointer gestures");
            runCommand("sh -c 'xinput list --name-only | grep ^xwayland-pointer-gestures | xargs -n1 xinput enable'", "xwayland pointer gestures enable");
            this.executed_xwayland_pointer_gestures_disable = false;
        }
        if (this.MINIMIZE_ANIMATION_TIME !== null) {
            log (`Restoring minimize animation (time to ${this.MINIMIZE_WINDOW_ANIMATION_TIME})`);
            WindowManager.MINIMIZE_WINDOW_ANIMATION_TIME = this.MINIMIZE_WINDOW_ANIMATION_TIME;
            this.MINIMIZE_WINDOW_ANIMATION_TIME = null;
        }
    }
}

function init() {
    log(`initializing ${Me.metadata.name}`);
    ExtensionUtils.initTranslations(Me.metadata.uuid);
    return new Extension();
}

