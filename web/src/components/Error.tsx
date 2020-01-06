import * as React from "react"
import { ListGroup, Table } from "react-bootstrap"
import * as moment from "moment"
import { AggregatedError, Error, HttpContext, Headers } from "data/types"

interface Props {
  activeError: AggregatedError
}

const ErrorComponent =  (props: Props) => {

  const renderError = (error: Error) => {
    if (error == null) return

    return (
      <ListGroup variant="flush">
        <ListGroup.Item>
          <h4 className="list-group-item-heading"> Class</h4>
          { error.error.class }
        </ListGroup.Item>
        { renderMessage(error.error.message) }
        { renderCurl(error.http_context) }
        { renderStackTrace(error.error.stacktrace) }
        { renderCause(error.error.cause) }
        { renderHttpContext(error.http_context) }
      </ListGroup>
    )
  }

  const renderStackTrace = (stackTrace: string[]) => {
    if (stackTrace === null || stackTrace.length === 0) {
      return ""
    }
    const trace =  stackTrace.map((line) => line + "\n")
    return (
      <ListGroup.Item>
        <h4 className="list-group-item-heading"> Trace</h4>
        <pre className="pre-scrollable"><code>{ trace }</code></pre>
    </ListGroup.Item>
    )
  }

  const renderLastOccurrence = (ts: number) => {
    return moment(new Date(ts * 1000)).fromNow()
  }

  const renderCause = (cause: Error) => {
    if (cause === null) {
      return ""
    }

    return (
      <ListGroup.Item>
        <h4 className="list-group-item-heading"> Cause</h4>
        { renderError(cause) }
      </ListGroup.Item>
    )
  }

  const renderMessage = (message: string) => {
    if (message === null || message.trim().length === 0) {
      return ""
    }

    return (
      <ListGroup.Item>
        <h4 className="list-group-item-heading"> Message</h4>
        { message }
      </ListGroup.Item>
    )
  }

  const renderCurl = (context: HttpContext) => {
    if (context == null) {
      return ""
    }

    let headers: Headers = context.request_headers == null ? {} : context.request_headers

    let headersString: string = Object.keys(headers).reduce(function(headersString, key) {
      return `${headersString}-H "${key}: ${headers[key]}" `
    }, "")

    return (
      <ListGroup.Item>
        <h4 className="list-group-item-heading"> Curl</h4>
        <pre>curl -X { context.request_method } {headersString} {context.request_url}</pre>
      </ListGroup.Item>
    )
  }

  const renderContextHeadersRow = (key: string, value: string) => {
    return (
      <tr key={key}>
        <td>{`${key}`}</td>
        <td>{`${value}`}</td>
      </tr>
    )
  }

  const renderContextHeaders = (context: HttpContext) => {
    if (context.request_headers == null) {
      return ""
    } else {
      return Object.keys(context.request_headers).map(function(key) {
        return renderContextHeadersRow(key, context.request_headers[key])
      })
    }
  }

  const renderHttpContext = (context: HttpContext) => {
    if (context == null) {
      return ""
    }

    return (
      <ListGroup.Item>
        <h4 className="list-group-item-heading"> HTTP Context</h4>
        <ListGroup>
          <ListGroup.Item>
            <h4 className="list-group-item-heading"> Url</h4>
            {context.request_url}
          </ListGroup.Item>
          <ListGroup.Item>
            <h4 className="list-group-item-heading"> Method</h4>
            {context.request_method}
          </ListGroup.Item>
          <ListGroup.Item>
            <h4 className="list-group-item-heading"> Headers</h4>
            <Table striped>
              <tbody>
                { renderContextHeaders(context) }
              </tbody>
            </Table>
          </ListGroup.Item>
        </ListGroup>
      </ListGroup.Item>
    )
  }

  const renderAggregatedError = () => {
    return (
      <div className={"grid-component"}>
        <h3 className="list-group-item-heading"> Summary</h3>
        <ListGroup>
          <ListGroup.Item>
            <h4 className="list-group-item-heading"> Key</h4>
            {props.activeError.aggregation_key}
          </ListGroup.Item>
          <ListGroup.Item>
            <h4 className="list-group-item-heading"> Count</h4>
            {props.activeError.total_count}
          </ListGroup.Item>
          <ListGroup.Item>
            <h4 className="list-group-item-heading"> Severity</h4>
            {props.activeError.severity}
          </ListGroup.Item>
          <ListGroup.Item>
            <h4 className="list-group-item-heading"> Last Occurrence</h4>
            {renderLastOccurrence(props.activeError.latest_errors[0].timestamp)}
          </ListGroup.Item>
        </ListGroup>
        <br/>
        <h3 className="list-group-item-heading"> Last Exception</h3>
        {renderError(props.activeError.latest_errors[0]) }
      </div>
    )
  }

    return (
      <div>
        { renderAggregatedError() }
      </div>
    )
  }

export default ErrorComponent
