## Mute Twitch Ads
A script to mute ads on twitch.tv. It does not skip ads, it makes the ad video black and muted. If the stream is displayed during the ad (as a mini video on the side), it will unmute it so you can hear the stream. If you want to change the volume while an ad is playing, use the volume controls of the mini stream.

## Installation
- You need the [uBlock Origin](https://github.com/gorhill/uBlock) extension installed on your browser
- Open the extension's settings
- On the `Settings` tab (first one), at the bottom, check the `I am an advanced user` and open advanced settings by clicking on the gears
- Set the following configuration (you can also put the permalink of the latest commit if you want to ensure immutability)
```
userResourcesLocation https://raw.githubusercontent.com/doominator42/ublock-mute-twitch-ads/master/mute-twitch-ads.js
```
