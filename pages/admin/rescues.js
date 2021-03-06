// Module imports
import React from 'react'





// Component imports
import Page from '../../components/Page'
import RescuesTablePanel from '../../components/RescuesTablePanel'





// Component constants
const title = 'Rescues'





const Rescues = () => (
  <div className="page-wrapper">
    <header className="page-header">
      <h1>{title}</h1>
    </header>

    <div className="page-content">
      <RescuesTablePanel />
    </div>
  </div>
)

export default Page(title, true)(Rescues)
