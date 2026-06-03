import { homeService } from "@/services/homeService";

export const homeApi = {
  getSummary: homeService.getSummary,
  getSafetySummary: homeService.getSafetySummary,
  getWellnessSummary: homeService.getWellnessSummary,
  getEmergencyContacts: homeService.getEmergencyContacts,
  createEmergencyContact: homeService.createEmergencyContact,
  deleteEmergencyContact: homeService.deleteEmergencyContact,
  getHomes: homeService.getHomes,
  createHome: homeService.createHome,
  joinHome: homeService.joinHome,
  createHomeInvitation: homeService.createHomeInvitation,
  getHomeSettings: homeService.getHomeSettings,
  updateHome: homeService.updateHome,
  updateHomeMemberRole: homeService.updateHomeMemberRole,
  removeHomeMember: homeService.removeHomeMember,
};
