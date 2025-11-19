using AutoMapper;
using OnlineBank.Core.DTOs.BranchDtos;
using OnlineBank.Core.Models;

namespace OnlineBank.Core.Mappings
{
    public class BranchProfile : Profile
    {
        public BranchProfile()
        {
            CreateMap<Branch, BranchReadDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.BranchName))
                .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.BranchCode))
                .ForMember(dest => dest.BranchType, opt => opt.MapFrom(src => src.BranchType.ToString()));

            CreateMap<Branch, BranchDetailDto>();

            CreateMap<CreateBranchDto, Branch>();
            CreateMap<UpdateBranchDto, Branch>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            
            CreateMap<User, BranchManagerDto>();
        }
    }
}