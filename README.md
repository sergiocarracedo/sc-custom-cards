# Room Card

Room Card is a custom Lovelace card for Home Assistant that displays information about a room, including temperature, humidity.
It can also summarize device type statuses. For example can summarize the status of room lights, If one light is on it will show light icon as on, if all lights are off it will show light icon as off.

It is designed to provide a clean and customizable interface for monitoring and controlling devices in a specific area.

![img.png](docs/img.png)

Using `style: header` the card will render in a header style, showing the room name and a summary of the devices in that room. That is useful for a custom dashboard for the room.

![img_1.png](docs/img_1.png)


## Features
- Displays room-specific data such as temperature, humidity, and device statuses.
- Supports alarms, lights, doors, windows, and other entities.
- Fully customizable layout and appearance.
- Responsive design that adapts to different screen sizes.

## Installation
1. **Install via HACS**:
   - Add this repository to HACS.
   - Search for "SC Custom Room Card" in the HACS store and install it.
2. **Manual Installation**:
   - Download the latest release from the GitHub repository.
   - Place the files in your Home Assistant `www` folder.
   - Add the resource to your Lovelace configuration:
     ```yaml
     resources:
       - url: /local/room-card/room-card.js
         type: module
     ```

## Configuration
To use the Room Card, add it to your Lovelace dashboard. 

### Configuration Options
| Option                | Type       | Required | Description                                                          |
|-----------------------|------------|----------|----------------------------------------------------------------------|
| `area`                | `string`   | Yes      | The area or room to display information for.                         |
| `style`               | `string`   | No       | The style of the card (e.g., `header`, `full`).  (`full` by default) |
| `color`               | `string`   | No       | The color of the card (e.g., `#f90`, `var(--green)`).                |
| `summary`             | `array`    | No       | A list of entity groups to summarize (e.g., lights, doors, windows). |
| `summary[].name`      | `string`   | Yes      | The name of the entity group.                                        |
| `summary[].icon`      | `string`   | Yes      | The icon to represent the entity group.                              |
| `summary[].entities`  | `array`    | Yes      | A list of entity IDs for the group.                                  |
| `summary[].alarm_entities` | `array` | No       | A list of of entities to show as alarms.                             |
| `tap_action`         | `ActionConfig`   | No       | Action to perform on tap (e.g., navigate to another view).           |
| `hold_action`        | `ActionConfig`   | No       | Action to perform on hold (e.g., show more details).                 |
| `double_tap_action`  | `ActionConfig`   | No       | Action to perform on double tap (e.g., toggle a device).             |

The cards provides predefined entity groups for `lights`, `doors`, `windows`, and `alarms`.

### ActionConfig
| Option                | Type       | Required | Description                                                          |
|-----------------------|------------|----------|----------------------------------------------------------------------|
| `action`              | `string`   | Yes      | The action to perform (e.g., `more-info`, `navigate`).               |
| `navigation_path`     | `string`   | No       | The path to navigate to (if applicable).                             |


### Example Configuration
Below is an example configuration:

```yaml
type: custom:room-card
area: living_room
summary:
  - name: Lights
    icon: mdi:lightbulb
    entities:
      - light.living_room_main
      - light.living_room_lamp
    alarm_entities:
      - binary_sensor.living_room_smoke_alarm
  - name: Doors
    icon: mdi:door
    entities:
      - binary_sensor.living_room_door
    alarm_entities:
      - binary_sensor.living_room_door_alarm
  - name: Windows
    icon: mdi:window-closed
    entities:
      - binary_sensor.living_room_window
    alarm_entities:
      - binary_sensor.living_room_window_alarm
presence:
  - binary_sensor.living_room_occupancy
```

### Example Use Cases
1. **Living Room Monitoring**:
   Monitor the temperature, humidity, and status of lights, doors, and windows in the living room.
2. **Bedroom Control**:
   Display the status of alarms, lights, and environmental sensors in the bedroom.

## Troubleshooting
- Ensure the card is installed correctly and added as a resource in your Lovelace configuration.
- Check the browser console for errors if the card does not load.
- Verify that the entity IDs in your configuration exist in your Home Assistant setup.

## Support
For issues or feature requests, please visit the [GitHub repository](https://github.com/sergiocarracedo/sc-custom-cards) and open an issue.
