// Kendo UI theme for data visualization widgets
// Use as theme: 'newTheme' in configuration options (or change the name)
kendo.dataviz.ui.registerTheme('newTheme', {
    "chart": {
        "title": {
            "color": "#ffffff"
        },
        "legend": {
            "labels": {
                "color": "#ffffff"
            }
        },
        "chartArea": {
            "background": "#0e0e0e"
        },
        "seriesDefaults": {
            "labels": {
                "color": "#ffffff"
            }
        },
        "axisDefaults": {
            "line": {
                "color": "#cecece"
            },
            "labels": {
                "color": "#ffffff"
            },
            "minorGridLines": {
                "color": "#2d2d2d"
            },
            "majorGridLines": {
                "color": "#333333"
            },
            "title": {
                "color": "#ffffff"
            }
        },
        "seriesColors": [
            "#00aba9",
            "#309b46",
            "#8ebc00",
            "#ff6900",
            "#e61e26",
            "#d8e404"
        ],
        "tooltip": {}
    },
    "gauge": {
        "pointer": {
            "color": "#00aba9"
        },
        "scale": {
            "rangePlaceholderColor": "#2d2d2d",
            "labels": {
                "color": "#ffffff"
            },
            "minorTicks": {
                "color": "#333333"
            },
            "majorTicks": {
                "color": "#cecece"
            },
            "line": {
                "color": "#cecece"
            }
        }
    }
});