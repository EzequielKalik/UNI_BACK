import UniversityRepository from "../repositories/university-repository.js";
import CommonRepository from "../repositories/common-repository.js";

export default class UniversityService {
  constructor() {
    this.universityRepo = new UniversityRepository();
    this.commonRepo = new CommonRepository();
    this.TABLE = "universidades";
  }

  async getAll() {
    const universidades = await this.universityRepo.getAllExpanded();
    return universidades;
  }

  async getById(id) {
    if (!id || Number.isNaN(Number(id))) {
      const err = new Error('Parámetro id inválido');
      err.status = 400;
      throw err;
    }
    const universidad = await this.universityRepo.getByIdExpanded(id);
    if (!universidad) {
      return null;
    }
    return universidad;
  }

  async getCarrerasByUniversidad(idUniversidad) {
    if (!idUniversidad || Number.isNaN(Number(idUniversidad))) {
      const err = new Error('Parámetro idUniversidad inválido');
      err.status = 400;
      throw err;
    }
    const universidad = await this.commonRepo.getById(this.TABLE, idUniversidad);
    if (!universidad) {
      return null;
    }
    const carreras = await this.universityRepo.getCarrerasByUniversidad(idUniversidad);
    return carreras;
  }

  async getCarrerasWithCategorias(idUniversidad) {
    if (!idUniversidad || Number.isNaN(Number(idUniversidad))) {
      const err = new Error('Parámetro idUniversidad inválido');
      err.status = 400;
      throw err;
    }
    const universidad = await this.commonRepo.getById(this.TABLE, idUniversidad);
    if (!universidad) {
      return null;
    }
    const carreras = await this.universityRepo.getCarrerasWithCategorias(idUniversidad);
    return carreras;
  }

}

