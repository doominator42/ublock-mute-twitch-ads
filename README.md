## Mute Twitch Ads
A script to mute ads on twitch.tv. It does not skip ads, it makes the ad video black and muted. If the stream is displayed during the ad (as a mini video on the side), it will unmute it so you can continue to listen to the stream while the ad is playing. If you want to change the volume while an ad is playing, use the volume controls of the mini stream.

## Installation
- You need the [uBlock Origin](https://github.com/gorhill/uBlock) extension installed on your browser
- Open the extension's settings
- On the `Settings` tab (first one), at the bottom, check the `I am an advanced user` and open advanced settings by clicking on the gears
- Set the following configuration (you can also put the permalink of the latest commit if you want to ensure immutability)
    ```
    userResourcesLocation https://raw.githubusercontent.com/doominator42/ublock-mute-twitch-ads/master/mute-twitch-ads.js
    ```
- On the `My filters` tab, add the following lines
    ```
    www.twitch.tv##+js(mute-twitch-ads)
    m.twitch.tv##+js(mute-twitch-ads)
    ```
- Refresh any previously opened Twitch tabs to apply the filter
