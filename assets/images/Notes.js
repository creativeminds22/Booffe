import React from "react";
import Svg, { Path } from "react-native-svg";

const NotesIcon = props => (
  <Svg viewBox="0 0 56 56" {...props}>
    <Path fill="#56b46f" d="M0 16h56v32H0z" />
    <Path fill="#74be86" d="M52 16H2v-4z" />
    <Path
      d="M41 32c0 7.18-5.82 13-13 13s-13-5.82-13-13 5.82-13 13-13 13 5.82 13 13"
      fill="#4d8157"
    />
    <Path
      d="M21.094 43C17.438 40.699 15 36.639 15 32s2.438-8.699 6.094-11H10.975A5.5 5.5 0 0 1 5 26.975v10.05A5.5 5.5 0 0 1 10.975 43h10.119zM50.5 27a5.5 5.5 0 0 1-5.475-6H34.906C38.562 23.301 41 27.361 41 32s-2.438 8.699-6.094 11h10.119A5.5 5.5 0 0 1 51 37.025v-10.05a5.506 5.506 0 0 1-.5.025M5.5 24C4.121 24 3 22.879 3 21.5S4.121 19 5.5 19 8 20.121 8 21.5 6.879 24 5.5 24M50.5 24c-1.379 0-2.5-1.121-2.5-2.5s1.121-2.5 2.5-2.5 2.5 1.121 2.5 2.5-1.121 2.5-2.5 2.5M5.5 45C4.121 45 3 43.879 3 42.5S4.121 40 5.5 40 8 41.121 8 42.5 6.879 45 5.5 45M50.5 45c-1.379 0-2.5-1.121-2.5-2.5s1.121-2.5 2.5-2.5 2.5 1.121 2.5 2.5-1.121 2.5-2.5 2.5"
      fill="#eaead7"
    />
    <Path fill="#83c38e" d="M5 8v4.24L52 16h3z" />
    <Path
      d="M33.568 35.025a1.74 1.74 0 0 0 1.232-1.656v-.87a1.74 1.74 0 0 0-.938-1.535c-.384-3.274-2.548-4.599-6.027-4.599-.164 0-.326.006-.484.019-1.183.094-2.379-.128-3.362-.791-.409-.276-.753-.568-.995-.876-.111-.14-.332-.051-.311.127.035.304.086.66.164 1.048.287 1.445.115 1.234-.444 2.598a9.025 9.025 0 0 0-.601 2.477c-.55.294-.932.867-.932 1.532v.87c0 .78.523 1.436 1.232 1.656.471 1.762 1.438 3.171 3.121 3.896v.997a.67.67 0 0 1-.373.6l-3.361 1.656a2.808 2.808 0 0 0-.745.614A12.944 12.944 0 0 0 28 45c2.587 0 4.992-.765 7.017-2.068a2.849 2.849 0 0 0-.926-.736l-3.279-1.676a.668.668 0 0 1-.365-.595v-1.004c1.683-.725 2.65-2.134 3.121-3.896"
      fill="#eaead7"
    />
  </Svg>
);

export default NotesIcon;