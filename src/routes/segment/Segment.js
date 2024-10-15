import UploadImage from "../../components/UploadImage";
import { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, doc, db, collection, getDoc, getDocs } from "../../Firebase";
import { Instructions } from "../../helpers";
import { BsJournalCheck } from "react-icons/bs";
import { BiUserVoice, BiImages } from "react-icons/bi";
import "./style.css";
import { CSVLink } from "react-csv";

const officialImages = true;

function Segment() {
  const [user, loading, error] = useAuthState(auth);
  const [uid, setUid] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [admin, setAdmin] = useState(null);

  const navigate = useNavigate();

  const [csvUserData, setUserData] = useState([]);

  const [csvImageData, setImageData] = useState([]);

  const images = [
    "Degenspondy1_Lat",
    "Degenspondy2_Lat",
    "DLS1_Lat",
    "DLS2_Lat",
    "Normal1_L",
    "Normal2_L",
    "PriorPSF1_Lat",
    "PriorPSF2_Lat",
    "PriorTLIF1_Lat",
    "PriorTLIF2_Lat",
    "Spondy1_Lat",
    "Spondy2_Lat",
  ];

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setUid(null);
      return navigate("/");
    } else {
      setUid(user.uid);
      firebaseUser(user.uid);
    }
  }, [user, loading]);

  const firebaseUser = async (userID) => {
    const instr = new Instructions();
    try {
      const uRef = doc(db, "users", userID);
      const uDoc = await getDoc(uRef);
      const data = uDoc.data();

      instr.setName(data.last, data.title, data.first);
      setAdmin(data.admin);
      if (data.admin) {
        imageData();
        userData();
      }
    } catch (e) {
      console.error("Error retrieving user firebase doc: ", e);
    }
    setInstructions(instr);
  };

  const imageData = async () => {
    // columns: "imageID", "sessionID", [0,47], "userID"
    let arr = [];
    let headings = ["imageID", "sessionID", "userID"];
    for (let i = 0; i < 48; i++) {
      headings.push(i);
    }
    arr.push(headings);

    await Promise.all(
      images.map(async (i) => {
        try {
          const querySnapshot = await getDocs(
            collection(db, `new_images/${i}/sessions`)
          );
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            let row = [i, doc.id, doc.data().user];
            if (doc.data().data) {
              row = row.concat(doc.data().data);
            }
            arr.push(row);
          });
        } catch (e) {
          console.error("Error retrieving image sessions: ", e);
        }
      })
    );
    setImageData(arr);
  };

  const userData = async () => {
    // columns: "userID", "first", "last", "title",
    // "session1_id", "session1_computer", "session1_start", "session1_end", "session1_mouse", "session1_computer_size"
    // "session2_id", "session2_computer", "session2_start", "session2_end", "session2_mouse", "session2_computer_size"
    let arr = [];
    let headings = [
      "userID",
      "first",
      "last",
      "title",
      "session_id",
      "session_num",
      "computer",
      "start",
      "end",
      "mouse",
      "computer_size",
    ];
    arr.push(headings);

    try {
      const querySnapshot = await getDocs(collection(db, `new_users`));
      await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          try {
            const subcollectionSnapshot = await getDocs(
              collection(db, `new_users/${doc.id}/sessions`)
            );
            subcollectionSnapshot.forEach((session) => {
              // doc.data() is never undefined for query doc snapshots
              let size = session.data().size ? session.data().size : null;
              if (size && size.indexOf('"') != -1) {
                size = size.replace('"', "in");
              }
              arr.push([
                doc.id,
                doc.data().first,
                doc.data().last,
                doc.data().title,
                session.id,
                session.data().index,
                session.data().computer,
                session.data().start,
                session.data().end,
                session.data().mouse,
                size,
              ]);
            });
          } catch (e) {
            console.error("Error retrieving user sessions: ", e);
          }
        })
      );
    } catch (e) {
      console.error("Error retrieving users: ", e);
    }
    setUserData(arr);
  };

  const checkStatus = () => {
    var copy = [];

    for (var i = 0; i < csvImageData.length; i++)
      copy[i] = csvImageData[i].slice();

    let s_dict = {};
    copy.forEach((row) => {
      let num_undefined = 0;
      for (let i = 3; i < row.length; i++) {
        if (row[i] == null) num_undefined++;
      }
      if (num_undefined <= 24) {
        if (row[1] in s_dict) {
          //session exists in dict
          s_dict[row[1]].push(row[0]);
        } else {
          s_dict[row[1]] = [row[0]];
        }
      }
    });

    let u_dict = {};
    csvUserData.forEach((row) => {
      if (row[4] in s_dict) {
        if (row[2] in u_dict) {
          u_dict[row[2]] += 1;
        } else {
          u_dict[row[2]] = 1;
        }
      }
    });

    alert(JSON.stringify(u_dict));
  };

  if (user && uid && instructions) {
    return (
      <div>
        <UploadImage
          uid={uid}
          instructions={instructions}
          sessions={collection(db, "new_users/" + uid + "/sessions")}
          officialImages={officialImages}
        />
        {admin ? (
          <div className="bottom_left">
            <div className="download">
              <CSVLink data={csvUserData} filename={"users.csv"}>
                <BiUserVoice color="white" />
              </CSVLink>
            </div>
            <div className="download">
              <CSVLink data={csvImageData} filename={"images.csv"}>
                <BiImages color="white" />
              </CSVLink>
            </div>
            <div className="download">
              <BsJournalCheck
                onClick={() => {
                  checkStatus();
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  } else {
    return null;
  }
}
export default Segment;
