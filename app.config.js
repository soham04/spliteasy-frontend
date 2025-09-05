import 'dotenv/config';

export default {
  expo: {
    name: "spliteasy",
    slug: "spliteasy",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "spliteasy",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sohamshinde.spliteasy",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.sohamshinde.spliteasy",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: "com.googleusercontent.apps.437466271417-0tfdbds6c8delaecvf38k55b0of2vgd2",
        },
      ],
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      googleWebClientId: "437466271417-0onhgkk95piohlcdcsfnfvbhsmm1je4h.apps.googleusercontent.com",
      googleIosClientId: "437466271417-0tfdbds6c8delaecvf38k55b0of2vgd2.apps.googleusercontent.com",
    },
  },
};
