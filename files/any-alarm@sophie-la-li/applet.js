const Applet = imports.ui.applet;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;
const Main = imports.ui.main; 
const St = imports.gi.St;

function AnyAlarmApplet(metadata, orientation, panel_height, instance_id) {
    this._init(metadata, orientation, panel_height, instance_id);
}

AnyAlarmApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(metadata, orientation, panel_height, instance_id) {
        Applet.IconApplet.prototype._init.call(this, orientation, panel_height, instance_id);
        this.set_applet_icon_symbolic_name("alarm");
        this.set_applet_tooltip(_("AnyAlarm"));

        this.refreshCounter = 0;
        this.timeouts = [];
        this.state = {};
        this.settings = new Settings.AppletSettings(this.state, metadata.uuid, instance_id);
        this.settings.bindProperty(Settings.BindingDirection.IN, 'alarm-text', 'alarmText', () => this.refresh(), null);
        this.settings.bindProperty(Settings.BindingDirection.IN, 'interval', 'interval', () => this.refresh(), null);
        this.refresh();
    },

    refresh: function() {
        this.refreshCounter += 1;
        this.removeTimer();
        this.timeouts.push(
            Mainloop.timeout_add_seconds(this.state.interval * 60, () => this.alarm(this.state.alarmText, this.refreshCounter))
        );
    },

    removeTimer: function() {
        for (let i = 0; i < this.timeouts.length; i++) {
            Mainloop.source_remove(this.timeouts[i]);
        }
        this.timeouts = [];
    },

    alarm: function(text, refreshCounter = 0) {
        // don't execute and continue alarms that were updated or removed
        if (this.refreshCounter != refreshCounter) {
            return false;
        }

        let icon = new St.Icon({
            icon_name: 'error',
            icon_type: St.IconType.FULLCOLOR,
            icon_size: 36
        });
        Main.criticalNotify(_('AnyAlarm'), text, icon);
        return true;
    },

    on_applet_removed_from_panel: function() {
        this.refreshCounter += 1;
        this.removeTimer();
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new AnyAlarmApplet(metadata, orientation, panel_height, instance_id);
}
