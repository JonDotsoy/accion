import type { Meta, StoryObj } from "@storybook/react"
import { ChartView } from "../www/components/chart-view.tsx"
import React, { useEffect, useState } from "react"
import ms from "ms"

const meta: Meta<typeof ChartView> = {
    component: ChartView
}

export default meta

type Story = StoryObj<typeof ChartView>

export const Demo1: Story = {
    args: {
        chart: {
            jobs: [
                { id: 'a', name: 'a', status: 'progressing' },
                { id: 'b', name: 'b', status: 'pending' },
                { id: 'c', name: 'c', status: 'pending' },
            ],
            relations: [
                { source: 'a', target: 'c' },
                { source: 'a', target: 'b' },
            ]
        }
    }
}

export const Demo2: Story = {
    args: {
        chart: {
            jobs: [
                { id: 'a', name: 'a', status: 'success', duration: ms('59.9m') },
                { id: 'b', name: 'b', status: 'failed', duration: ms('98s') },
                { id: 'c', name: 'c', status: 'progressing', duration: 153 },
                { id: 'd', name: 'd', status: 'pending' },
                { id: 'e', name: 'e', status: 'pending' },
            ],
            relations: [
                { source: 'a', target: 'b' },
                { source: 'b', target: 'c' },
                { source: 'c', target: 'd' },
                { source: 'd', target: 'e' },
            ]
        }
    }
}

export const Demo3: Story = {
    args: {
        autoFocus: 'd',
        chart: {
            jobs: [
                { id: 'a', name: 'a', status: 'success', duration: ms('59.9m') },
                { id: 'b', name: 'b', status: 'failed', duration: ms('98s') },
                { id: 'c', name: 'c', status: 'progressing', duration: 153 },
                { id: 'd', name: 'd', status: 'pending' },
                { id: 'e', name: 'e', status: 'pending' },
                { id: 'f', name: 'f', status: 'pending' },
            ],
            relations: [
                { source: 'a', target: 'b' },
                { source: 'b', target: 'c' },
                { source: 'c', target: 'd' },
                { source: 'd', target: 'e' },
                { source: 'e', target: 'f' },
            ]
        }
    }
}

export const TransitionBetweenStates: Story = {
    args: {
        chart: {
            jobs: [
                { id: 'a', name: 'a', status: 'pending' },
                { id: 'b', name: 'b', status: 'pending' },
                { id: 'c', name: 'c', status: 'pending' },
            ],
            relations: [
                { source: 'a', target: 'c' },
                { source: 'a', target: 'b' },
            ]
        }
    },
    decorators: [
        (Story, { args }) => {
            const [nextArgs, setNextArgs] = useState(args)

            useEffect(() => {
                let nextId = 'd'.charCodeAt(0)
                const t = setInterval(() => {
                    const jobId = String.fromCharCode(nextId++)
                    setNextArgs(args => ({
                        ...args,
                        chart: {
                            ...args.chart,
                            jobs: [
                                ...args.chart.jobs,
                                { id: jobId, name: 'Job D', status: 'pending' },
                            ],
                            relations: [
                                ...args.chart.relations,
                                { source: jobId, target: 'b' },
                            ],
                        },
                    }));
                }, 1000)

                return () => {
                    clearInterval(t)
                }
            }, [])

            return <div><Story args={nextArgs} /></div>
        },
    ],
}

