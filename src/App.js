import { useState } from "react";

import { useAccount, useContract, useSigner } from "wagmi";
import { getContract } from "@wagmi/core";
import { CONTRACT_ABI, CONTRACT_ADDRESS} from "./contract"

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Web3Storage } from "web3.storage";
import env from "react-dotenv"

const client = new Web3Storage({ token : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGU2OTlDOTllZTA3MzcwMGUxODQzQTk5OEQyMUU0MjlEZmYzODVBYjMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTQ5NTE4NzU5MjksIm5hbWUiOiJGaWxlU3RvcmFnZURhcHAifQ.6qgkH7vEcfHi3kTvrHn7lfwg0rp-0aHM8wcTEtCY3AM"})

function App() {


  // Contract definitions
  const { address } = useAccount();

  const { data : signer } = useSigner();

  const contract = useContract({
    address:CONTRACT_ADDRESS,
    abi:CONTRACT_ABI,
    signerOrProvider:signer
  })

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [files, setFiles] = useState(null);

  const captureFile = async(e) => {
    try {
      setFile(e.target.files);
      setFileName(e.target.files[0].name);
      setFileSize(e.target.files[0].size);
      setFileType(e.target.files[0].type);  
    } catch (err) {
      console.error(err);
    }
  }

  const uploadFile = async(e) => {
    e.preventDefault();
    console.log("Uploading");
    if (file) {
      try {
        const uploadedFile = await client.put(file,
          {
            name:fileName,
            maxRetries:3,
            wrapWithDirectory:false
        })
        console.log(uploadedFile);

        const uploadTxn = await contract.uploadFile(uploadedFile.toString(), fileSize?.toString(), fileType?.toString, fileName?.toString());

        await uploadTxn.wait();

        console.log(uploadTxn);

      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("No File Found!");
    }
  }

  const getFilesUploaded = async() => {
    try {
      const fileCount = await contract.fileCount();
      let filesArr = [];
      for (let i = 0; i < +fileCount?.toString(); i++) {
        const file = await contract.files(address, i);
        console.log(file[3])
        const file_obj = {
          id: file[0]?.toString(),
          hash: file[1],
          size: file[2]?.toString(),
          type: file[3].toString(),
          name: file[4],
          uploadTime: (file[5].toString())
        };
        filesArr.push(file_obj);
      }
      console.log(filesArr);
      setFiles(filesArr)
    } catch (err) {
      console.error(err);
    }
  }

  
  return (
    <div className="bg-black text-white">
      <div className="flex items-center justify-between flex-row px-4 py-2">
        <h1 className="text-2xl font-bold">File Storage</h1>
        <ConnectButton />
      </div>
      <div className="w-50 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-extrabold">
          Upload Files
        </h1>
        <div className="mb-8 mt-6 ">
          <form
            onSubmit={(e) => uploadFile(e)}
            className="px-4"
          >
            <div className="mt-4 flex justify-between mx-4">
              <input
                className="mx-4 cursor-pointer bg-white hover:bg-blue-500 text-blue-700 hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded font-bold dark:bg-gray-700 dark:text-gray-100 dark:border-gray-900 transform transition hover:scale-110"
                type="file"
                placeholder={fileName ? fileName : "Choose a file"}
                id="filecap"
                onChange={(e)=>captureFile(e)}
              />
              {/* <label 
                htmlFor="fileCap"
                className="mx-4 cursor-pointer bg-white hover:bg-blue-500 text-blue-700 hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded font-bold dark:bg-gray-700 dark:text-gray-100 dark:border-gray-900 transform transition hover:scale-110"
              >
                {fileName ? fileName : "Choose a file"}
              </label> */}
              <button
                type="submit"
                className="mx-4 py-2 px-4 rounded font-bold bg-white text-blue-700 border border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-900 hover:border-tranparent hover:bg-blue-500 hover:text-white transform transition hover:scale-110"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
        <button
          className="mx-4 py-2 px-4 rounded font-bold bg-white text-blue-700 border border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-900 hover:border-tranparent hover:bg-blue-500 hover:text-white transform transition hover:scale-110"
          onClick={getFilesUploaded}
        >
          Get All Files
        </button>
        <div className="flex flex-col mx-6 my-8">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg dark:border-black">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-blue-opaque">
                    <tr className="border-b dark:border-gray-600">
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        id
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        name
                      </th>
                      
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        size
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        hash/view/get
                      </th>
                    </tr>
                  </thead>
                  {files?.length > 0 && files.map((file, key) => (
                    <tbody
                      className="bg-white dark:bg-blue-opaque divide-y divide-gray-200"
                      key={key}
                    >
                      <tr>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 ">
                              {file.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 ">
                            {file.name}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-pink-100 dark:text-pink-800">
                            {file.size}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {file.uploadTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                          <a
                            href={
                              "https://ipfs.io/ipfs/" + file.hash
                            }
                            className="text-indigo-600 hover:text-indigo-900 dark:text-purple-400 dark:hover:text-purple-700"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {file.hash.substring(0, 15)}...
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>    
  );
}

export default App;
