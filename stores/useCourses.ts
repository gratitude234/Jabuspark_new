import { defineStore } from 'pinia'
import { useSupabaseClient } from '#imports'

export interface CourseRow {
  id: string
  code: string
  title: string
  level?: string | null
  faculty?: string | null
  department?: string | null
}

export const useCourses = defineStore('courses', {
  state: () => ({
    allCourses: [] as CourseRow[],
    myCourses: [] as CourseRow[],
    selectedCourseId: null as string | null,
    loading: false,
  }),
  actions: {
    async fetchCourses() {
      const client = useSupabaseClient()
      this.loading = true
      const data = await $fetch<CourseRow[]>('/api/courses')
      this.allCourses = data
      this.loading = false
      return data
    },
    async fetchMyCourses() {
      const data = await $fetch<{ course?: CourseRow; courseId?: string }[]>(
        '/api/courses/enrolments',
      )
      this.myCourses = data
        .map((row) => row.course)
        .filter(Boolean) as CourseRow[]
      return this.myCourses
    },
    async enrol(courseId: string) {
      await $fetch('/api/courses/enrol', { method: 'POST', body: { courseId } })
      await this.fetchMyCourses()
    },
    async unenrol(courseId: string) {
      await $fetch('/api/courses/unenrol', { method: 'POST', body: { courseId } })
      await this.fetchMyCourses()
    },
    selectCourse(courseId: string | null) {
      this.selectedCourseId = courseId
    },
  },
})
