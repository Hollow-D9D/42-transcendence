import { useState } from "react";
import { DisplayRow } from "./DisplayRowUsers";

// export const SearchResultDisplay = (props: any) => {
//     const [isUpdated, setUpdate] = useState(false)

//     return (
//         <div style={{ overflowY: "auto", overflowX: "hidden" }}>
//             {props?.length !== 0 ? (
//                 props!.map((h: any, index: any) => {
//                     console.log("h:", h.login, "index:", index)
//                     return (
//                         <DisplayRow
//                             listType={"addFriend"}
//                             hook={setUpdate}
//                             state={isUpdated}
//                             key={index}
//                             userModel={h.userModel}
//                         />
//                     );
//                 })
//             ) : (
//                 <span>No friend requests.</span>
//             )}
//         </div>
//     );
// }