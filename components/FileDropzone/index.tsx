import { RowError } from "csv-file-validator"
import Image from "next/image"
import { useState } from "react"
import { Alert, Button, ListGroup, ListGroupItem, Spinner } from "react-bootstrap"
import { useDropzone } from "react-dropzone"
import { REQUEST_STATUS } from "../../types"
import styles from "./index.module.scss"

const FileDropzone = ({
  onDrop,
  fileType,
  fileName,
  fileErrors,
  onSubmit,
  removeFile,
  mutationStatus,
}: {
  onDrop: (acceptedFiles: File[]) => void
  fileType: string
  fileName: null | string
  fileErrors: RowError[]
  onSubmit: () => void
  removeFile: () => void
  mutationStatus: REQUEST_STATUS
}) => {
  const [numOfErrorsDisplayed, setNumOfErrorsDisplayed] = useState(6)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <>
      <div className={styles.container}>
        {mutationStatus === REQUEST_STATUS.IDLE &&
          (fileName && fileErrors.length < 1 ? (
            <>
              <div className={styles.fileContainer}>
                <div className={styles.file}>
                  <Image
                    className={styles.icon}
                    src="/icons/file-icon.svg"
                    alt="happy file icon"
                    width={30}
                    height={30}
                  />
                  <span>
                    <em>{fileName}</em>
                  </span>
                </div>
                <button
                  aria-label="Remove file"
                  className={styles.delete}
                  onClick={() => {
                    setNumOfErrorsDisplayed(6)
                    removeFile()
                  }}>
                  <Image
                    src="/icons/trash-bin-icon.svg"
                    alt="trash can icon"
                    width={30}
                    height={30}
                  />
                </button>
              </div>
              <Button
                onClick={() => {
                  setNumOfErrorsDisplayed(6)
                  onSubmit()
                }}
                className={styles.button}
                variant="primary">
                Upload file
              </Button>
            </>
          ) : (
            <Button
              {...getRootProps()}
              onClick={(e) => {
                setNumOfErrorsDisplayed(6)
                const props = getRootProps()
                if (props && props.onClick) {
                  props.onClick(e)
                }
              }}
              className={styles.button}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>{"Drop the file here ..."}</p>
              ) : fileErrors.length > 0 ? (
                <p>
                  {"Retry dropping "}
                  <strong>{fileType}</strong> {" file"}
                </p>
              ) : (
                <p>
                  {"Drag 'n' drop "}
                  <strong>{fileType}</strong>
                  {" file here, or click to select file"}
                </p>
              )}
            </Button>
          ))}
        {mutationStatus === REQUEST_STATUS.FETCHING && (
          <div className={styles.loading}>
            <Spinner variant="primary" />
            <span>Uploading...</span>
          </div>
        )}
        {mutationStatus === REQUEST_STATUS.ERROR && (
          <Alert variant="danger">Oops! There was an error uploading the file.</Alert>
        )}
        {mutationStatus === REQUEST_STATUS.SUCCESS && (
          <Alert variant="success">File uploaded!</Alert>
        )}
      </div>
      {fileErrors.length > 0 && (
        <div className={styles.errors}>
          <Alert variant="danger">File errors:</Alert>
          <ListGroup>
            {fileErrors.map((error, index) => {
              if (index === numOfErrorsDisplayed && index < fileErrors.length) {
                return (
                  <Button
                    key={index}
                    variant="secondary"
                    onClick={() => setNumOfErrorsDisplayed((prev) => prev + 6)}>
                    Show more
                  </Button>
                )
              } else if (index > numOfErrorsDisplayed && index < fileErrors.length) {
                return
              }
              return (
                <ListGroupItem key={index}>
                  <span style={{ marginRight: "1rem" }}>{"☛"}</span>
                  {error.message}
                </ListGroupItem>
              )
            })}
          </ListGroup>
        </div>
      )}
    </>
  )
}

export default FileDropzone
