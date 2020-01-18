import { graphql, useStaticQuery } from "gatsby"
import { descend, sort, sortWith } from "ramda"
import React, { FC, HTMLAttributes, memo, useState } from "react"
import useBuildTree from "../../hooks/useBuildTree"
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll"
import useSidebar from "../../hooks/useSidebar"
import TriangleDown from "../../icons/triangle-down.svg"
import { IAllResourcesQuery, IFileOrFolder, IFolder } from "../../types"
import { getPath, humanize } from "../../utils"
import { Sidebar } from "../Sidebar"
import * as SC from "./styles"
import useMatchingPath from "./useMatchingPath"

const ALL_RESOURCES = graphql`
  query {
    allFile(filter: { sourceInstanceName: { eq: "resources" } }) {
      edges {
        node {
          relativePath
          childMarkdownRemark {
            frontmatter {
              authors
              title
              date
            }
          }
        }
      }
    }
  }
`

const childrenSort = sortWith<IFileOrFolder>([
  descend(f => {
    if (f.title === "intro") {
      return 1
    }

    if (f.type === "folder") {
      return 0
    }

    return -1
  }),
])

function Tree({
  item,
  index,
  firstLevel,
}: {
  item: IFileOrFolder
  index?: number
  firstLevel?: boolean
}) {
  const { setOpenOnMobile } = useSidebar()
  const { unlock } = useLockBodyScroll()

  if (item.type === "file") {
    const path = getPath(item)

    return (
      <SC.PageLink
        key={item.title}
        to={path}
        activeClassName="active"
        onClick={() => {
          setOpenOnMobile(false)
          unlock()
        }}
      >
        {humanize(item.title)}
      </SC.PageLink>
    )
  }

  if (firstLevel && index !== undefined) {
    return <FirstLevelFolder key={item.title} item={item} index={index} />
  }

  return <Folder key={item.title} item={item} />
}

function Folder({ item }: { item: IFolder }) {
  const [collapsed, setCollapse] = useState(true)

  useMatchingPath(item.path, () => {
    setCollapse(false)
  })

  function toggleCollapse() {
    setCollapse(prevState => !prevState)
  }

  const sortedChildren = childrenSort(item.children)

  return (
    <SC.TreeWrapper collapsed={collapsed}>
      <SC.Label onClick={toggleCollapse}>
        <TriangleDown /> {humanize(item.title)}
      </SC.Label>
      <SC.Children>
        {sortedChildren.map(node => (
          <Tree item={node} />
        ))}
      </SC.Children>
    </SC.TreeWrapper>
  )
}

const FirstLevelFolder = memo(
  ({ item, index }: { item: IFolder; index: number }) => {
    const { current, setCurrent } = useSidebar()

    useMatchingPath(item.path, () => {
      setCurrent(index)
    })

    const collapsed = current !== index
    const sortedChildren = childrenSort(item.children)

    return (
      <SC.TreeWrapper className="firstLevel" collapsed={collapsed}>
        <SC.FirstLabel
          className={!collapsed ? "active" : undefined}
          onClick={() => setCurrent(index)}
        >
          {humanize(item.title)}
          <SC.CollapseToggler />
        </SC.FirstLabel>
        <SC.Children>
          {sortedChildren.map(node => (
            <Tree item={node} />
          ))}
        </SC.Children>
      </SC.TreeWrapper>
    )
  }
)

export const ResourcesSidebar: FC<HTMLAttributes<HTMLDivElement>> = props => {
  const resources = useStaticQuery<IAllResourcesQuery>(ALL_RESOURCES)
  const tree = useBuildTree(resources, "/resources")
  const sortedTree = sort((a, b) => a.title.localeCompare(b.title), tree)

  return (
    <Sidebar {...props}>
      {sortedTree.map((node, index) => (
        <Tree item={node} index={index} firstLevel={true} />
      ))}
    </Sidebar>
  )
}
