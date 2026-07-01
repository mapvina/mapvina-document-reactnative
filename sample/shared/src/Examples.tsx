import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import * as MapVinaExamples from "./examples/index";
import { sheet } from "./styles/sheet";

const styles = StyleSheet.create({
  exampleListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  exampleListItemBorder: {
    borderBottomColor: "#cccccc",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  exampleListLabel: {
    fontSize: 18,
  },
});

class ExampleItem {
  label: string;
  Component: any;

  constructor(label: string, Component: any) {
    this.label = label;
    this.Component = Component;
  }
}

class ExampleGroup {
  root: boolean;
  label: string;
  items: (ExampleGroup | ExampleItem)[];

  constructor(
    label: string,
    items: (ExampleGroup | ExampleItem)[],
    root = false,
  ) {
    this.root = root;
    this.label = label;
    this.items = items;
  }
}

const Examples = new ExampleGroup(
  "MapVina React Native",
  [
    new ExampleItem("Bug Report", MapVinaExamples.BugReport),
    new ExampleGroup("Map", [
      new ExampleItem("Show Map", MapVinaExamples.ShowMap),
      new ExampleItem("Local Style from JSON", MapVinaExamples.LocalStyleJSON),
      new ExampleItem("Show Click", MapVinaExamples.ShowClick),
      new ExampleItem(
        "Show Region did Change",
        MapVinaExamples.ShowRegionDidChange,
      ),
      new ExampleItem("Two Map Views", MapVinaExamples.TwoMaps),
      new ExampleItem(
        "Create Offline Region",
        MapVinaExamples.CreateOfflineRegion,
      ),
      new ExampleItem(
        "Get Pixel Point in Map",
        MapVinaExamples.PointInMap,
      ),
      new ExampleItem(
        "Show and hide a layer",
        MapVinaExamples.ShowAndHideLayer,
      ),
      new ExampleItem("Change Layer Color", MapVinaExamples.ChangeLayerColor),
      new ExampleItem(
        "Source Layer Visibility",
        MapVinaExamples.SourceLayerVisibility,
      ),
      new ExampleItem("Set Tint Color", MapVinaExamples.SetTintColor),
    ]),
    new ExampleGroup("Camera", [
      new ExampleItem(
        "Fit (Bounds, Center/Zoom, Padding)",
        MapVinaExamples.Fit,
      ),
      new ExampleItem("Set Pitch", MapVinaExamples.SetPitch),
      new ExampleItem("Set Heading", MapVinaExamples.SetHeading),
      new ExampleItem("Fly To", MapVinaExamples.FlyTo),
      new ExampleItem("Restrict Bounds", MapVinaExamples.RestrictMapBounds),
      new ExampleItem("Yo-yo Camera", MapVinaExamples.YoYo),
      new ExampleItem(
        "Take Snapshot Without Map",
        MapVinaExamples.TakeSnapshot,
      ),
      new ExampleItem(
        "Take Snapshot With Map",
        MapVinaExamples.TakeSnapshotWithMap,
      ),
      new ExampleItem("Get current Zoom", MapVinaExamples.GetZoom),
      new ExampleItem("Get Center", MapVinaExamples.GetCenter),
      new ExampleItem("Compass View", MapVinaExamples.CompassView),
    ]),

    new ExampleGroup("User Location", [
      new ExampleItem(
        "Follow User Location Alignment",
        MapVinaExamples.FollowUserLocationAlignment,
      ),
      new ExampleItem(
        "Follow User Location Render Mode",
        MapVinaExamples.FollowUserLocationRenderMode,
      ),
      new ExampleItem(
        "User Location for Navigation",
        MapVinaExamples.UserLocationForNavigation,
      ),
      new ExampleItem(
        "User Location Updates",
        MapVinaExamples.UserLocationUpdate,
      ),
      new ExampleItem(
        "User Location Displacement",
        MapVinaExamples.UserLocationDisplacement,
      ),

      new ExampleItem(
        "Set preferred Frames per Second\n(Android only)",
        MapVinaExamples.SetAndroidPreferredFramesPerSecond,
      ),
    ]),

    new ExampleGroup("Symbol/CircleLayer", [
      new ExampleItem("Custom Icon", MapVinaExamples.CustomIcon),
      new ExampleItem("Clustering Earthquakes", MapVinaExamples.Earthquakes),
      new ExampleItem(
        "Icon from Shape Source",
        MapVinaExamples.GeoJSONSourceIcon,
      ),
      new ExampleItem(
        "Data-driven Circle Colors",
        MapVinaExamples.DataDrivenCircleColors,
      ),
    ]),
    new ExampleGroup("Fill/RasterLayer", [
      new ExampleItem("GeoJSON Source", MapVinaExamples.GeoJSONSource),
      new ExampleItem(
        "OpenStreetMap Raster Tiles",
        MapVinaExamples.OpenStreetMapRasterTiles,
      ),
      new ExampleItem("Indoor Building Map", MapVinaExamples.IndoorBuilding),
      new ExampleItem("Query Feature Point", MapVinaExamples.QueryAtPoint),
      new ExampleItem(
        "Query Features Bounding Box",
        MapVinaExamples.QueryWithRect,
      ),
      new ExampleItem(
        "Custom Vector Source",
        MapVinaExamples.CustomVectorSource,
      ),
      new ExampleItem("Image Overlay", MapVinaExamples.ImageOverlay),
    ]),
    new ExampleGroup("LineLayer", [
      new ExampleItem("Gradient Line", MapVinaExamples.GradientLine),
    ]),
    new ExampleGroup("Sources", [
      new ExampleItem("PMTiles Map Style", MapVinaExamples.PMTilesMapStyle),
      new ExampleItem(
        "PMTiles Vector Source",
        MapVinaExamples.PMTilesVectorSource,
      ),
    ]),
    new ExampleGroup("Annotations", [
      new ExampleItem(
        "Show Point Annotation",
        MapVinaExamples.ShowPointAnnotation,
      ),
      new ExampleItem(
        "Point Annotation Anchors",
        MapVinaExamples.PointAnnotationAnchors,
      ),
      new ExampleItem("Marker View", MapVinaExamples.MarkerView),
      new ExampleItem("Heatmap", MapVinaExamples.Heatmap),
      new ExampleItem("Custom Callout", MapVinaExamples.CustomCallout),
    ]),
    new ExampleGroup("Animations", [
      new ExampleItem(
        "Animate Circle along Line",
        MapVinaExamples.AnimateCircleAlongLine,
      ),
      new ExampleItem("Animated Length", MapVinaExamples.AnimatedLength),
      new ExampleItem("Animated Morph", MapVinaExamples.AnimatedMorph),
      new ExampleItem("Animated Size", MapVinaExamples.AnimatedSize),
      new ExampleItem("Reanimated Point", MapVinaExamples.ReanimatedPoint),
    ]),
    new ExampleItem("Cache Management", MapVinaExamples.CacheManagement),
  ],
  true,
);

function FlatMapExamples(
  example: ExampleGroup | ExampleItem,
  flattenedExamples: (ExampleGroup | ExampleItem)[] = [],
): (ExampleGroup | ExampleItem)[] {
  if (example instanceof ExampleGroup) {
    return [
      ...flattenedExamples,
      ...example.items.flatMap((example) => FlatMapExamples(example)),
      example,
    ];
  }

  return [...flattenedExamples, example];
}

const FlatExamples = FlatMapExamples(Examples);

interface ExampleListProps {
  navigation: any;
  route: any;
}

function ExampleList({ route, navigation }: ExampleListProps) {
  const { name } = route;
  const example =
    FlatExamples.find((examples) => examples.label === name) || Examples;

  function itemPress(item: any) {
    navigation.navigate(item.label);
  }

  function renderItem({ item }: { item: any }) {
    return (
      <View style={styles.exampleListItemBorder}>
        <TouchableOpacity onPress={() => itemPress(item)}>
          <View style={styles.exampleListItem}>
            <Text style={styles.exampleListLabel}>{item.label}</Text>
            <Text style={{ fontSize: 24 }}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={sheet.matchParent}>
      <View style={sheet.matchParent}>
        <FlatList
          style={sheet.matchParent}
          data={example instanceof ExampleGroup ? example.items : []}
          keyExtractor={(item) => item.label}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

function buildNavigationScreens(example: any, Stack: any) {
  if (example instanceof ExampleGroup) {
    return (
      <Stack.Screen
        key={example.label}
        name={example.label}
        component={ExampleList}
      />
    );
  }
  return (
    <Stack.Screen
      key={example.label}
      name={example.label}
      component={example.Component}
    />
  );
}

export function Home() {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          card: "#295daa",
          primary: "#ffffff",
          background: "#ffffff",
          text: "#ffffff",
        },
      }}
    >
      <Stack.Navigator initialRouteName={Examples.label}>
        {FlatExamples.map((example) => buildNavigationScreens(example, Stack))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
