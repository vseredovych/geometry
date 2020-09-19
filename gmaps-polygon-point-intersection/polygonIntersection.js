// Create the script tag, set the appropriate attributes        
let script = document.createElement('script');
let apiKey = "";
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=drawing&v=weekly`;
script.defer = true;

let mapPolygonOverlays = [];
let mapPolygons = [];

let mapPointOverlay = null;
let mapPoint = null;

let eps = 0.00000001;

let notContainsColor = "#00CC00";
let containsPointColor = "#FF0000";

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), { 
        center: {lat: 49.842957, lng: 24.031111},
        zoom: 8
    });

    const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                google.maps.drawing.OverlayType.POLYLINE,
                google.maps.drawing.OverlayType.MARKER
            ]
        },
    });
    
    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
        if (e.type == google.maps.drawing.OverlayType.MARKER) {
            newPointCreated(e.overlay);
        }
        else if (e.type == google.maps.drawing.OverlayType.POLYLINE) {
            newPolygonCreated(e.overlay);
        }                
    })
}

function newPointCreated(pointOverlay) {
    // Remove old pointer if exists
    if (mapPointOverlay != null) {
        mapPointOverlay.setMap(null);
    }

    x = pointOverlay.getPosition().lng();
    y = pointOverlay.getPosition().lat();
    mapPoint = new Point(x,y);
    mapPointOverlay = pointOverlay;

    // Mark polynoms with point
    if (mapPolygons.length != null) {
        markPolygonsWithPoint(mapPolygons, mapPolygonOverlays, mapPoint);
    }
}

function newPolygonCreated(polygonOverlay) {
    polygonOverlay.setOptions({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35
    });
    polygonOverlay.setMap(map);

    polygonPoints = [];
    polygonCordinates = polygonOverlay.getPath().getArray();

    for (let i = 0; i < polygonCordinates.length; i++) {
        cord = polygonCordinates[i];
        x = cord.lng();
        y = cord.lat();
        polygonPoints.push(new Point(x, y));
    }

    mapPolygons.push(polygonPoints);
    mapPolygonOverlays.push(polygonOverlay);

    // Mark polynoms with point
    if (mapPoint != null){
        markPolygonsWithPoint(mapPolygons, mapPolygonOverlays, mapPoint);
    }
    else {
        polygonOverlay.setOptions({strokeWeight: 2.0, strokeColor: "#0ACF00"});
        polygonOverlay.setMap(map);
    }
}

function markPolygonsWithPoint(mapPolygons, mapPolygonOverlays, mapPoint){
    for (let i = 0; i < mapPolygons.length; i++){
        if (isPointInsidePolygon(mapPolygons[i], mapPoint)) 
        {
            color = containsPointColor;
            console.log("INFO: Point inside.");
        }                   
        else {
            color = notContainsColor;
            console.log("INFO: Point outside.");
        }
        mapPolygonOverlays[i].setOptions({strokeColor: color});
        mapPolygonOverlays[i].setMap(map);
    }
}

function isPointInsidePolygon(polygon, point) {
    /*
     * Algorithm: https://rosettacode.org/wiki/Ray-casting_algorithm
     */

    counter = 0;
    for (let i = 0; i < polygon.length; i++) {
        p1 = polygon[i];
        p2 = polygon[(i + 1) % polygon.length];

        if (rayIntersectsSegment(p1, p2, point)) {
            counter = counter + 1;
        }
    }
    if (counter % 2 == 0) {
        console.log(`INFO: count of ray intersections: ${counter}`);
        return false;
    }
    else {
        console.log(`INFO: count of ray intersections: ${counter}`);
        return true; 
    }
}

function rayIntersectsSegment(p1, p2, point)
{
    isInside = false;
    if (p1.y > p2.y) {
        buff = p1;
        p1 = p2;
        p2 = buff;
    }

    if (point.y == p1.y || point.y == p2.y) {
        point.y += eps;
    }

    if (point.y > p2.y || point.y < p1.y || point.x > Math.max(p1.x, p2.x)) {
        return false;
    }   
    else {
        if (point.x < Math.min(p1.x, p2.x)) {
            return true;
        }
        else {
            m_edge = (p2.y - p1.y) / (p2.x - p1.x)
            m_point = (point.y - p1.y) / (point.x - p1.x)

            if (m_point >= m_edge) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}
// Append the 'script' element to 'head'
document.head.appendChild(script);
let map;