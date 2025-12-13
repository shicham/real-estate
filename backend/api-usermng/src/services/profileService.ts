import { Profile } from '../models/Profile.js'
import AppError from '../lib/AppError.js'

export class ProfileService {
  async getAllProfiles() {
    const profiles = await Profile.find().exec()
    return profiles
  }

  async getProfileById(id: string) {
    const profile = await Profile.findById(id).exec()
    if (!profile) throw new AppError('Profile not found', 404)
    return profile
  }

  async getProfileByCode(code: string) {
    const profile = await Profile.findOne({ code }).exec()
    if (!profile) throw new AppError('Profile not found', 404)
    return profile
  }

  async createProfile(profileData: {
    name: string
    code: string
    description?: string
  }) {
    const { name, code, description } = profileData

    // Check if profile already exists
    const existing = await Profile.findOne({ code }).exec()
    if (existing) throw new AppError('Profile already exists', 400)

    const profile = new Profile({
      name,
      code,
      description
    })

    await profile.save()
    return profile
  }

  async updateProfile(id: string, profileData: {
    name?: string
    code?: string
    description?: string
  }) {
    const profile = await Profile.findByIdAndUpdate(id, profileData, { new: true }).exec()
    if (!profile) throw new AppError('Profile not found', 404)
    return profile
  }

  async deleteProfile(id: string) {
    const profile = await Profile.findByIdAndDelete(id).exec()
    if (!profile) throw new AppError('Profile not found', 404)
    return { message: 'Profile deleted successfully' }
  }
}

const profileService = new ProfileService()
export default profileService