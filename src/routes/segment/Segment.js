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
    "09d6d661-5c96-475f-84fc-a396f7dbf751",
    "19c4762b-25a3-4f75-9289-70c5ea396271",
    "1cfe0593-7a26-483f-afb4-a304387971f2",
    "3147ba94-28ec-4420-9412-2c203b7c759d",
    "31e885e5-5267-44b5-aa66-843b2754f549",
    "3546267a-20dc-432e-aad6-736f1d11b3dd",
    "49f9e813-66bf-46e1-a0d9-45e658398f4a",
    "4e0255c7-1a07-4840-9120-660faf66fa13",
    "69c34174-48a2-4014-9696-7ad97bf05686",
    "7854ec4b-85f2-4e9c-8235-a16fc6111065",
    "9b5b6e19-1eef-4dde-a176-777bd4d1b216",
    "9e8a4fb5-c624-40d1-9659-b2bd4da44c4f",
    "a9ba5695-4d0f-4878-8ac7-57307d41a6f4",
    "ac99a706-6115-419d-b27b-5dac8ebca73c",
    "c4f8667e-7d92-4cbf-9485-8a146834a1bc",
    "ced9c518-4815-4e8f-b6db-f6bd8a73b675",
    "d03d9a81-464e-4180-a12e-828c4594d066",
    "d70e08df-2a7b-4d8c-a290-3cff5f137346",
    "e59efe16-df24-4d9e-b8e1-0848880cc200",
    "e76df50f-60e2-419c-87bc-3806b3343afd",
    "efe2ce5c-0fd2-42cd-98d6-4f88ce290d2a",
    "f6198cca-b03c-431c-9ba2-445470a15c54",
    "f983cf99-7aaf-4f16-b2be-58ba83770755",
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
            collection(db, `images/${i}/sessions`)
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
      const querySnapshot = await getDocs(collection(db, `users`));
      await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          console.log("userID:" + doc.id);
          try {
            const subcollectionSnapshot = await getDocs(
              collection(db, `users/${doc.id}/sessions`)
            );
            subcollectionSnapshot.forEach((session) => {
              // doc.data() is never undefined for query doc snapshots
              console.log(session.id + ": " + session.data());
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
    console.log(arr);
    setUserData(arr);
  };

  const checkStatus = () => {
    // for each image check sessions data array
    // "complete" = array does not contain null
    // "mostly complete" = array contains <= 8 null items
    // "incomplete" = >8 null items
    // create status dict by {imageID : {sessionID: "status"}}
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

    console.log(s_dict);
    // for each user check sessions
    // for each session: check which imageID's have which status
    // generate three arrays: complete, mostly complete, incomplete
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
          sessions={collection(db, "users/" + uid + "/sessions")}
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
