import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  create(createNotificationDto: CreateNotificationDto) {
    return createNotificationDto;
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return { id, ...updateNotificationDto };
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
